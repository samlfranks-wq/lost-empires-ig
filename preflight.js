// Early warning for the queue. Answers one question: would the next scheduled
// reel actually publish?
//
//   node preflight.js             ← check credentials and every pending item
//   node preflight.js --days 7    ← only fail on items due within N days
//
// This repo had no preflight at all, which is how 2026-09-14 played out: the
// Pompeii asset was unfetchable, nothing checked it ahead of time, and the only
// signal was a red publish run at 20:52Z that nobody was watching. The YouTube
// side has had this since day one; Instagram needs it more, not less, because
// Instagram fetches the video ITSELF from the CDN and reports a failure as an
// opaque container status of "ERROR" with no reason attached.
//
// Nothing is published and nothing is written. This only looks.

import {readFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {loadEnv, graph, fail, Abort, sleep} from './lib.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const QUEUE = join(HERE, 'queue.json');

const flag = process.argv.indexOf('--days');
const DAYS = flag === -1 ? 7 : Number(process.argv[flag + 1]);

// A full GET, because that is what Instagram's own fetcher does.
//
// Deliberately NOT a range request: a Higgsfield object whose media_confirm
// never completed answers `bytes=0-1023` with 206 and Content-Type video/mp4
// while a full GET of the same url returns 403. The body is cancelled as soon
// as the headers land, so this costs a round trip, not the file.
export async function probe(url, kind = 'video') {
  if (!/^https?:/i.test(url)) {
    const local = join(HERE, url);
    return existsSync(local)
      ? {ok: true, note: 'local file'}
      : {ok: false, note: 'local file missing (and CI has no copy)'};
  }
  let res;
  try {
    res = await fetch(url, {method: 'GET'});
  } catch (e) {
    return {ok: false, note: `unreachable: ${e.message}`};
  }
  if (!res.ok) {
    res.body?.cancel();
    return {ok: false, note: `HTTP ${res.status}`};
  }
  const type = res.headers.get('content-type') || '';
  const total = Number(res.headers.get('content-length')) || 0;
  res.body?.cancel();

  const want = kind === 'cover' ? /^image\// : /^video\//;
  if (!want.test(type)) return {ok: false, note: `content-type ${type || 'unknown'}`};
  if (total && total < 10_000) return {ok: false, note: `only ${total} bytes — wrong URL?`};
  return {ok: true, note: total ? `${(total / 1e6).toFixed(1)} MB` : 'reachable'};
}

async function main() {
  if (!existsSync(QUEUE)) fail(`No queue.json at ${QUEUE}.`);
  const items = JSON.parse(readFileSync(QUEUE, 'utf8'));
  const pending = items
    .filter((it) => !it.posted)
    .sort((a, b) => new Date(a.at) - new Date(b.at));

  // Credentials first: a dead long-lived token makes everything else moot.
  const env = loadEnv(['IG_USER_ID', 'IG_ACCESS_TOKEN']);
  const me = await graph(env, `/${env.IG_USER_ID}`, {params: {fields: 'username'}});
  console.log(`\ncredentials  OK — token still resolves @${me.username}`);

  if (!pending.length) {
    console.log('\nQueue is empty. Nothing scheduled.\n');
    return;
  }

  // A backlog that cannot self-clear is its own failure, separate from a broken
  // asset. The one-per-day guard drains the queue at exactly the rate it fills,
  // so an overdue item stays overdue for ever until the dates are rebased.
  const now = new Date();
  const overdue = pending.filter((it) => new Date(it.at) <= now);
  if (overdue.length > 1) {
    console.log(`::warning::${overdue.length} items are overdue. One post per day means this backlog cannot self-clear — rebase the queue dates.`);
  }

  const horizon = new Date(now.getTime() + DAYS * 86_400_000);
  console.log(`\n${pending.length} pending; checking every source URL:\n`);

  const broken = [];
  let first = true;
  for (const it of pending) {
    if (new Date(it.at) > horizon) {
      console.log(`  --    ${it.at.slice(0, 10)}  beyond the ${DAYS}-day horizon`);
      continue;
    }
    if (!first) await sleep(1200);          // keep the burst under the CDN's rate limit
    first = false;

    const v = await probe(it.url, 'video');
    const c = it.cover ? await probe(it.cover, 'cover') : {ok: true, note: 'no cover'};
    const ok = v.ok && c.ok;
    const hook = (it.caption || '').split('\n')[0].slice(0, 44);
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${it.at.slice(0, 10)}  ${`${v.note} / ${c.note}`.padEnd(30)}  ${hook}`);
    if (!ok) broken.push({at: it.at, note: [!v.ok && `video ${v.note}`, !c.ok && `cover ${c.note}`].filter(Boolean).join(', ')});
  }

  if (broken.length) {
    console.error(`\n${broken.length} item(s) due in the next ${DAYS} days cannot be fetched:`);
    for (const b of broken) console.error(`  ${b.at}  ${b.note}`);
    console.error('\nRe-upload the asset (and make sure media_confirm returns "uploaded" —');
    console.error('an unconfirmed object is served inconsistently and Instagram will');
    console.error('reject it), then repoint queue.json before the publish window.\n');
    process.exitCode = 1;
    return;
  }

  console.log(`\nAll items due in the next ${DAYS} days are fetchable.\n`);
}

// probe() is exported for tests, so only run the check when invoked directly.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    if (!(e instanceof Abort)) console.error(`\n${e.message}\n`);
    process.exitCode = 1;
  });
}
