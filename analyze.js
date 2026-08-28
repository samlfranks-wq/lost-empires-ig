// Deep performance analysis of trial reels. Read-only — publishes nothing.
//
//   node analyze.js            # last 30 posts
//   node analyze.js --limit 50
//
// Trial reels are shown only to non-followers, so REACH is the algorithm's
// verdict on the content — it decided how far to push it. That makes reach the
// primary outcome variable, not a vanity metric.

import {loadEnv, graph} from './lib.js';

const argv = process.argv.slice(2);
const li = argv.indexOf('--limit');
const limit = li === -1 ? 30 : Number(argv[li + 1]) || 30;

const env = loadEnv();
const list = await graph(env, `${env.IG_USER_ID}/media`, {
  params: {fields: 'id,caption,media_type,timestamp,permalink', limit: String(limit)},
});

const METRICS = 'views,reach,likes,comments,shares,saved,total_interactions';
const rows = [];
for (const m of list.data) {
  const ins = {};
  try {
    const r = await graph(env, `${m.id}/insights`, {params: {metric: METRICS}});
    for (const x of r.data) ins[x.name] = x.values?.[0]?.value ?? 0;
  } catch {}
  const cap = m.caption || '';
  rows.push({
    id: m.id,
    when: m.timestamp,
    date: m.timestamp?.slice(0, 16).replace('T', ' ') ?? '',
    hook: cap.split('\n')[0],
    link: m.permalink,
    views: ins.views ?? 0,
    reach: ins.reach ?? 0,
    inter: ins.total_interactions ?? 0,
    likes: ins.likes ?? 0,
    comments: ins.comments ?? 0,
    shares: ins.shares ?? 0,
    saves: ins.saved ?? 0,
  });
}

// Topic key: first few distinctive words, so re-posts of the same story group.
const TOPICS = [
  [/vesuvius|pompeii|volcano/i, 'Pompeii / Vesuvius'],
  [/dancing in the street|dancing plague/i, 'Dancing plague 1518'],
  [/cleopatra|rolled inside a ca|famous rumour/i, 'Cleopatra'],
  [/viking/i, 'Vikings'],
  [/aubigny|kissed a woman at a royal ball|kissed a g/i, "Julie d'Aubigny"],
  [/catherine the great/i, 'Catherine the Great'],
  [/g(ö|o)ring|nazi/i, 'Göring'],
  [/impotence|impote/i, 'French impotence trial'],
  [/athens|phryne|one gesture/i, 'Phryne'],
  [/electrically shoc|milgram|65%/i, 'Milgram'],
];
const topicOf = (h) => (TOPICS.find(([re]) => re.test(h)) || [null, 'Other'])[1];
for (const r of rows) r.topic = topicOf(r.hook);

const pct = (a, b) => (b ? (a / b) * 100 : 0);
const f1 = (n) => n.toFixed(1);
const pad = (s, n) => String(s).padEnd(n);
const lp = (s, n) => String(s).padStart(n);

// ---------- per topic ----------
const byTopic = {};
for (const r of rows) (byTopic[r.topic] ||= []).push(r);

const agg = Object.entries(byTopic).map(([topic, rs]) => {
  const n = rs.length;
  const reach = rs.reduce((a, r) => a + r.reach, 0);
  const inter = rs.reduce((a, r) => a + r.inter, 0);
  const deep = rs.reduce((a, r) => a + r.saves + r.shares, 0);
  const reaches = rs.map((r) => r.reach).sort((a, b) => a - b);
  return {
    topic, n,
    avgReach: reach / n,
    minReach: reaches[0],
    maxReach: reaches[n - 1],
    eng: pct(inter, reach),
    deepPer1k: reach ? (deep / reach) * 1000 : 0,
  };
}).sort((a, b) => b.avgReach - a.avgReach);

console.log('\n═══ BY TOPIC (avg reach = how far the algorithm pushed it) ═══\n');
console.log(pad('TOPIC', 24) + lp('N', 3) + lp('AVG REACH', 11) + lp('RANGE', 14) + lp('ENG%', 7) + lp('SAVE+SHR/1k', 13));
console.log('─'.repeat(72));
for (const t of agg) {
  console.log(
    pad(t.topic, 24) + lp(t.n, 3) + lp(Math.round(t.avgReach), 11) +
    lp(t.n > 1 ? `${t.minReach}-${t.maxReach}` : '—', 14) +
    lp(f1(t.eng) + '%', 7) + lp(f1(t.deepPer1k), 13)
  );
}

// ---------- reproducibility: same topic posted more than once ----------
console.log('\n═══ REPEATABILITY (same story posted more than once) ═══\n');
for (const t of agg.filter((x) => x.n > 1)) {
  const rs = byTopic[t.topic].slice().sort((a, b) => a.when.localeCompare(b.when));
  const spread = t.maxReach / Math.max(1, t.minReach);
  console.log(
    pad(t.topic, 24) + pad(rs.map((r) => r.reach).join(' → '), 30) +
    `spread ${f1(spread)}x`
  );
}

// ---------- engagement leaders ----------
console.log('\n═══ ENGAGEMENT RATE (interactions per reach) ═══\n');
const eng = rows.filter((r) => r.reach >= 100)
  .map((r) => ({...r, e: pct(r.inter, r.reach)}))
  .sort((a, b) => b.e - a.e);
console.log(pad('HOOK', 50) + lp('REACH', 7) + lp('ENG%', 7) + lp('SV+SH', 7));
console.log('─'.repeat(71));
for (const r of eng.slice(0, 5))
  console.log(pad(r.hook.slice(0, 48), 50) + lp(r.reach, 7) + lp(f1(r.e) + '%', 7) + lp(r.saves + r.shares, 7));
console.log('  ...');
for (const r of eng.slice(-5))
  console.log(pad(r.hook.slice(0, 48), 50) + lp(r.reach, 7) + lp(f1(r.e) + '%', 7) + lp(r.saves + r.shares, 7));

// ---------- the 30 July burst, matched for age ----------
const burst = rows.filter((r) => r.when >= '2026-07-30' && r.when < '2026-07-31')
  .sort((a, b) => b.reach - a.reach);
if (burst.length) {
  console.log(`\n═══ 30 JULY BATCH — ${burst.length} posts, same age, fair comparison ═══\n`);
  console.log(pad('HOOK', 50) + lp('REACH', 7) + lp('ENG%', 7));
  console.log('─'.repeat(64));
  for (const r of burst)
    console.log(pad(r.hook.slice(0, 48), 50) + lp(r.reach, 7) + lp(f1(pct(r.inter, r.reach)) + '%', 7));
  const med = burst.map(r => r.reach).sort((a,b)=>a-b)[Math.floor(burst.length/2)];
  console.log(`\n  median reach in batch: ${med}`);
}

// ---------- totals ----------
const S = (k) => rows.reduce((a, r) => a + r[k], 0);
console.log('\n═══ TOTALS ═══');
console.log(`  posts ${rows.length}   reach ${S('reach')}   views ${S('views')}   interactions ${S('inter')}`);
console.log(`  likes ${S('likes')}   comments ${S('comments')}   shares ${S('shares')}   saves ${S('saves')}`);
console.log(`  overall eng ${f1(pct(S('inter'), S('reach')))}%   save+share per 1k reach ${f1(((S('saves')+S('shares'))/S('reach'))*1000)}`);
console.log('');
