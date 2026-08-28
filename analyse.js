// Deeper performance read than stats.js. Read-only.
//
//   node analyse.js [--limit 20]
//
// Adds the two metrics that actually explain distribution:
//   avg watch time  - did the hook hold? (ms, and as % of video length)
//   shares + saves  - the signals Instagram weights hardest for reach
//
// Reach is the honest denominator for trial reels: they only go to
// non-followers, so reach IS cold-audience distribution.

import {loadEnv, graph} from './lib.js';

const argv = process.argv.slice(2);
const li = argv.indexOf('--limit');
const limit = li === -1 ? 20 : Number(argv[li + 1]) || 20;

const env = loadEnv();

const list = await graph(env, `${env.IG_USER_ID}/media`, {
  params: {fields: 'id,caption,timestamp,permalink,media_type', limit: String(limit)},
});

const CORE = 'views,reach,likes,comments,shares,saved,total_interactions';

const rows = [];
for (const m of list.data) {
  const ins = {};
  try {
    const r = await graph(env, `${m.id}/insights`, {params: {metric: CORE}});
    for (const x of r.data) ins[x.name] = x.values?.[0]?.value ?? 0;
  } catch {}
  let watch = 0;
  try {
    const r = await graph(env, `${m.id}/insights`, {params: {metric: 'ig_reels_avg_watch_time'}});
    watch = r.data?.[0]?.values?.[0]?.value ?? 0;
  } catch {}

  rows.push({
    when: (m.timestamp || '').slice(0, 16).replace('T', ' '),
    hook: (m.caption || '').split('\n')[0].slice(0, 40),
    link: m.permalink,
    views: ins.views ?? 0,
    reach: ins.reach ?? 0,
    watchMs: watch,
    likes: ins.likes ?? 0,
    comments: ins.comments ?? 0,
    shares: ins.shares ?? 0,
    saved: ins.saved ?? 0,
    inter: ins.total_interactions ?? 0,
  });
}

const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : '—');
const pad = (s, n) => String(s).padEnd(n);
const lp = (s, n) => String(s).padStart(n);

console.log('');
console.log(
  pad('POSTED', 17) + pad('HOOK', 42) + lp('VIEWS', 7) + lp('REACH', 7) +
  lp('WATCH', 8) + lp('SHR', 5) + lp('SAV', 5) + lp('ENG%', 7)
);
console.log('─'.repeat(98));
for (const r of rows) {
  console.log(
    pad(r.when, 17) + pad(r.hook, 42) + lp(r.views, 7) + lp(r.reach, 7) +
    lp(r.watchMs ? (r.watchMs / 1000).toFixed(1) + 's' : '—', 8) +
    lp(r.shares, 5) + lp(r.saved, 5) + lp(pct(r.inter, r.reach), 7)
  );
}

const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
console.log('─'.repeat(98));
console.log(
  pad(`TOTAL (${rows.length})`, 59) + lp(sum('views'), 7) + lp(sum('reach'), 7) +
  lp('', 8) + lp(sum('shares'), 5) + lp(sum('saved'), 5) +
  lp(pct(sum('inter'), sum('reach')), 7)
);

// Ranking by reach, which is what a trial reel is actually testing.
console.log('\nBY COLD REACH:');
[...rows].sort((a, b) => b.reach - a.reach).slice(0, 8).forEach((r, i) => {
  console.log(`  ${i + 1}. ${lp(r.reach, 5)}  shares ${lp(r.shares, 2)}  saves ${lp(r.saved, 2)}  ${r.hook}`);
});
console.log('');
