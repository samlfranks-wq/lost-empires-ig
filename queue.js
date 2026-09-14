// Scheduled posting. Reads queue.json, finds the first entry whose `at` time
// has passed and which hasn't posted yet, publishes it, and records the result
// back into queue.json.
//
//   node queue.js            ← dry run: shows what is due, publishes nothing
//   node queue.js --confirm  ← publishes the one due item
//
// Run it on a schedule (Windows Task Scheduler, hourly) to post unattended.
// It publishes at most ONE item per run, so a misconfigured queue can never
// dump your whole backlog onto the account at once.
//
// queue.json format. `at` is UTC — in British Summer Time that is one hour
// BEHIND the clock, so 18:00Z fires at 19:00 local.
// [
//   {
//     "at": "2026-07-31T18:00:00Z",
//     "url": "https://.../video.mp4",
//     "cover": "https://.../thumb.jpg",     // optional poster frame
//     "trial": "manual",                     // optional: manual | performance
//     "caption": "..."
//   }
// ]

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {fail} from './lib.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const QUEUE = join(HERE, 'queue.json');

if (!existsSync(QUEUE)) fail(`No queue.json at ${QUEUE}. See the format in this file's header.`);

const items = JSON.parse(readFileSync(QUEUE, 'utf8'));
const now = new Date();
const confirm = process.argv.includes('--confirm');

// Is the source actually fetchable? A Higgsfield CDN object that was never
// confirmed goes 403 after about a day, and because a dead item stays due it
// used to block every later day behind it. Checked HERE rather than reacting to
// post.js's exit code, because that code cannot tell a dead URL apart from a
// transient Instagram rejection - and skipping on a transient failure would
// silently drop a post.
async function sourceOk(url) {
  if (!/^https?:\/\//i.test(url)) return true;          // local path, post.js handles it
  try {
    // Ask for the whole object, the way Instagram will. The old check asked for
    // `bytes=0-1023` and accepted the 206, which a dead CDN object answers
    // happily while a full GET of the same url returns 403.
    //
    // Honest limit, measured 2026-09-14: this does NOT catch every bad asset.
    // The Pompeii object that Instagram rejected answers 200 to Node's fetch
    // and 403 to curl at the same moment - CloudFront serves an unconfirmed
    // upload inconsistently across edges, so no client-side probe can promise
    // Instagram will draw a good one. The durable fix is upstream: never queue
    // a url whose media_confirm did not return "uploaded".
    const r = await fetch(url, {method: 'GET'});
    if (!r.ok) return false;
    const type = r.headers.get('content-type') || '';
    const len  = Number(r.headers.get('content-length') || 0);
    r.body?.cancel();                                    // headers are enough; drop the stream
    return /^(video|image)\//.test(type) && len > 100_000;
  } catch {
    return false;
  }
}

const due = items
  .map((it, idx) => ({it, idx}))
  .filter(({it}) => !it.posted && new Date(it.at) <= now)
  .sort((a, b) => new Date(a.it.at) - new Date(b.it.at));

if (!due.length) {
  const next = items.filter((it) => !it.posted).sort((a, b) => new Date(a.at) - new Date(b.at))[0];
  console.log(next ? `Nothing due. Next: ${next.at} — ${next.url}` : 'Queue empty.');
  process.exit(0);
}

// One post per day — hard rule for this account. Burst posting on 27 Aug 2026
// cost 30x reach (posts 3 and 4 got 4 and 6 views against 179 for post 2).
const today = new Date().toISOString().slice(0, 10);
const alreadyToday = items.find((it) => it.posted && it.posted.slice(0, 10) === today);
if (alreadyToday) {
  console.log(`Already posted today (${alreadyToday.at}). One per day — stopping.`);
  process.exit(0);
}

const skipped = [];
let posted = false;

for (const {it, idx} of due) {
  console.log(`Due: ${it.at}\n  ${it.url}`);

  const badUrl   = !(await sourceOk(it.url));
  const badCover = it.cover ? !(await sourceOk(it.cover)) : false;
  if (badUrl || badCover) {
    it.skips = (it.skips || 0) + 1;
    it.lastError = `${new Date().toISOString().slice(0, 16)}Z unfetchable ${badUrl ? 'url' : 'cover'}`;
    skipped.push(it);
    console.error(`SKIPPED ${it.at} — ${badUrl ? 'video' : 'cover'} URL is unfetchable; this one stays queued.`);
    continue;
  }

  const args = ['post.js', '--url', it.url, '--caption', it.caption ?? ''];
  if (it.cover) args.push('--cover', it.cover);
  if (it.trial) args.push('--trial', it.trial);
  if (confirm) args.push('--confirm');
  const res = spawnSync(process.execPath, args, {cwd: HERE, stdio: 'inherit'});

  if (!confirm) process.exit(0);

  if (res.status === 0) {
    items[idx] = {...it, posted: new Date().toISOString()};
    posted = true;
    console.log('✔ Marked as posted in queue.json');
  } else {
    // NOT skipped: the source was fine, so this is Instagram's side. Leave it
    // due and retry next run rather than stepping over real content.
    console.error('✖ Publish failed — leaving the item in the queue to retry next run.');
    if (skipped.length) writeFileSync(QUEUE, JSON.stringify(items, null, 2) + '\n');
    process.exit(1);
  }
  break;
}

if (posted || skipped.length) writeFileSync(QUEUE, JSON.stringify(items, null, 2) + '\n');

if (skipped.length) {
  console.error(`\n${skipped.length} item(s) skipped for an unfetchable source:`);
  for (const it of skipped) console.error(`  ${it.at}  (skipped ${it.skips}x)  ${it.lastError}`);
  console.error('Re-upload the asset and repoint queue.json; they post on the next run.');
}
if (!posted && skipped.length && confirm) {
  console.error('Everything due has a broken source URL. Nothing was posted.');
  process.exit(1);
}
