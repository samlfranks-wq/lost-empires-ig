// Performance report for recent posts. Read-only — publishes nothing.
//
//   node stats.js            # last 10 posts
//   node stats.js --limit 25
//
// Reach is the honest number for trial reels: they only go to non-followers,
// so reach IS cold-audience distribution. Views/reach tells you whether the
// hook held; interactions/reach tells you whether the content landed.

import {loadEnv, graph} from './lib.js';

const argv = process.argv.slice(2);
const limitIdx = argv.indexOf('--limit');
const limit = limitIdx === -1 ? 10 : Number(argv[limitIdx + 1]) || 10;

const env = loadEnv();

const list = await graph(env, `${env.IG_USER_ID}/media`, {
  params: {fields: 'id,caption,media_type,timestamp,permalink', limit: String(limit)},
});

const METRICS = 'views,reach,likes,comments,shares,saved,total_interactions';

const rows = [];
for (const m of list.data) {
  let ins = {};
  try {
    const r = await graph(env, `${m.id}/insights`, {params: {metric: METRICS}});
    for (const x of r.data) ins[x.name] = x.values?.[0]?.value ?? 0;
  } catch {
    // Insights lag a few minutes on brand-new media, and some types have none.
  }
  // First line of the caption is the hook — that's what we're actually testing.
  const hook = (m.caption || '').split('\n')[0].slice(0, 46);
  rows.push({
    when: m.timestamp?.slice(0, 16).replace('T', ' ') ?? '',
    hook,
    link: m.permalink,
    views: ins.views ?? 0,
    reach: ins.reach ?? 0,
    inter: ins.total_interactions ?? 0,
    likes: ins.likes ?? 0,
    comments: ins.comments ?? 0,
    shares: ins.shares ?? 0,
    saved: ins.saved ?? 0,
  });
}

const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : '—');
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

console.log('');
console.log(
  pad('POSTED', 17) + pad('HOOK', 48) + lpad('VIEWS', 7) + lpad('REACH', 7) +
  lpad('INTER', 7) + lpad('ENG%', 7)
);
console.log('─'.repeat(93));
for (const r of rows) {
  console.log(
    pad(r.when, 17) + pad(r.hook, 48) + lpad(r.views, 7) + lpad(r.reach, 7) +
    lpad(r.inter, 7) + lpad(pct(r.inter, r.reach), 7)
  );
}

const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
console.log('─'.repeat(93));
console.log(
  pad(`TOTAL (${rows.length} posts)`, 65) + lpad(sum('views'), 7) +
  lpad(sum('reach'), 7) + lpad(sum('inter'), 7) + lpad(pct(sum('inter'), sum('reach')), 7)
);

// Breakdown of what interactions actually were — likes are cheap, saves and
// shares are the ones that predict distribution.
console.log('');
console.log(
  `  likes ${sum('likes')}   comments ${sum('comments')}   ` +
  `shares ${sum('shares')}   saves ${sum('saved')}`
);
console.log('');
for (const r of rows) console.log(`  ${r.link}  ${r.hook}`);
console.log('');
