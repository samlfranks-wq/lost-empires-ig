// Append a timestamped metrics snapshot for recent media. Read-only vs Instagram;
// only writes the local snapshots.jsonl.
//
//   node snapshot.js              # snapshot last 12 posts
//   node snapshot.js --limit 30
//   node snapshot.js --at 24      # replay: show each post's metrics nearest 24h of age
//
// Why this exists: Instagram insights are cumulative, so comparing a 3h-old post
// to a 25h-old post is meaningless. Snapshotting lets us compare like-for-like
// at matched age instead of guessing.

import {readFileSync, appendFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadEnv, graph} from './lib.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FILE = join(HERE, 'snapshots.jsonl');
const argv = process.argv.slice(2);
const num = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i === -1 ? dflt : Number(argv[i + 1]) || dflt;
};

// ---------- replay mode ----------
if (argv.includes('--at')) {
  const target = num('--at', 24);
  if (!existsSync(FILE)) {
    console.error('No snapshots.jsonl yet — run `node snapshot.js` a few times first.');
    process.exit(1);
  }
  const recs = readFileSync(FILE, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const byId = {};
  for (const r of recs) (byId[r.id] ||= []).push(r);
  const rows = Object.values(byId).map((rs) => {
    // the snapshot whose age is closest to the target
    const best = rs.reduce((a, b) =>
      Math.abs(b.age_h - target) < Math.abs(a.age_h - target) ? b : a);
    return best;
  }).filter((r) => Math.abs(r.age_h - target) <= target * 0.35)
    .sort((a, b) => b.reach - a.reach);

  console.log(`\n═══ METRICS AT ~${target}h OF AGE (within ±35%) ═══\n`);
  console.log('HOOK'.padEnd(44) + 'AGE'.padStart(6) + 'REACH'.padStart(7) +
              'V/R'.padStart(6) + 'ENG%'.padStart(6) + 'SV+SH'.padStart(6));
  console.log('─'.repeat(75));
  for (const r of rows) {
    console.log(
      r.hook.slice(0, 42).padEnd(44) + r.age_h.toFixed(1).padStart(6) +
      String(r.reach).padStart(7) + (r.views / r.reach).toFixed(2).padStart(6) +
      ((r.inter / r.reach) * 100).toFixed(1).padStart(6) +
      String(r.saves + r.shares).padStart(6)
    );
  }
  if (!rows.length) console.log('  (no snapshots near that age yet)');
  console.log('');
  process.exit(0);
}

// ---------- capture mode ----------
const limit = num('--limit', 12);
const env = loadEnv();
const list = await graph(env, `${env.IG_USER_ID}/media`, {
  params: {fields: 'id,caption,timestamp,permalink', limit: String(limit)},
});

const now = Date.now();
let n = 0;
for (const m of list.data) {
  const i = {};
  try {
    const r = await graph(env, `${m.id}/insights`, {
      params: {metric: 'views,reach,likes,comments,shares,saved,total_interactions'},
    });
    for (const x of r.data) i[x.name] = x.values?.[0]?.value ?? 0;
  } catch { continue; }
  if (!i.reach) continue;
  appendFileSync(FILE, JSON.stringify({
    captured_at: new Date(now).toISOString(),
    id: m.id,
    posted_at: m.timestamp,
    age_h: Number(((now - Date.parse(m.timestamp)) / 3.6e6).toFixed(2)),
    hook: (m.caption || '').split('\n')[0].slice(0, 60),
    permalink: m.permalink,
    views: i.views ?? 0,
    reach: i.reach ?? 0,
    inter: i.total_interactions ?? 0,
    likes: i.likes ?? 0,
    comments: i.comments ?? 0,
    shares: i.shares ?? 0,
    saves: i.saved ?? 0,
  }) + '\n');
  n++;
}
console.log(`snapshot written: ${n} posts → ${FILE}`);
