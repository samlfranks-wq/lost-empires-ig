// Instagram analytics collector. READ-ONLY — publishes nothing, deletes nothing.
//
//   node analytics.js                 # collect and write stats.json
//   node analytics.js --print         # also print a table
//   node analytics.js --limit 30      # how many recent posts to pull
//   node analytics.js --max-age 50    # skip entirely if stats.json is newer
//                                     # than 50 minutes (used by CI so the
//                                     # 15-min publish workflow doesn't commit
//                                     # a new stats.json every single run)
//
// Why this file exists: Cowork (and anything else off this machine) cannot
// reach graph.instagram.com. It CAN read raw.githubusercontent.com. So the
// Actions runner — which already holds the token and does have network — is
// what fetches the numbers, and stats.json in this public repo is the delivery
// mechanism. No credential ever leaves the runner.

import {readFileSync, writeFileSync, appendFileSync, existsSync, statSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadEnv, graph} from './lib.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'stats.json');
const HIST = join(HERE, 'stats_history.jsonl');
const HIST_MAX = 5000;

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const num = (f, d) => {
  const i = argv.indexOf(f);
  return i === -1 ? d : Number(argv[i + 1]) || d;
};

// ---------- freshness gate ----------
// Age is read from generated_at INSIDE stats.json, not from the file mtime:
// actions/checkout stamps every file with the checkout time, so mtime in CI is
// always "just now" and an mtime gate would skip forever.
const maxAge = num('--max-age', 0);
if (maxAge > 0 && existsSync(OUT)) {
  let stampedMs = null;
  try {
    stampedMs = Date.parse(JSON.parse(readFileSync(OUT, 'utf8')).generated_at);
  } catch { /* unreadable or hand-edited — fall through to mtime */ }
  if (!Number.isFinite(stampedMs)) stampedMs = statSync(OUT).mtimeMs;
  const ageMin = (Date.now() - stampedMs) / 60000;
  if (ageMin < maxAge) {
    console.log(`stats.json is ${ageMin.toFixed(0)} min old (< ${maxAge}) — skipping.`);
    process.exit(0);
  }
}

const limit = num('--limit', 30);
const env = loadEnv();
const now = new Date();

// ---------- account ----------
let account = {};
try {
  const me = await graph(env, 'me', {
    params: {
      fields: 'user_id,username,account_type,media_count,followers_count,follows_count',
    },
  });
  account = {
    id: me.user_id || me.id || env.IG_USER_ID,
    username: me.username || null,
    account_type: me.account_type || null,
    followers: me.followers_count ?? null,
    following: me.follows_count ?? null,
    media_count: me.media_count ?? null,
  };
} catch (e) {
  account = {id: env.IG_USER_ID, error: String(e.message).slice(0, 200)};
}

// ---------- account-level insights (last 28 days) ----------
// These are separate from per-post insights and are the closest thing to a
// channel health line. Not every metric is available on every account type,
// so each one is attempted independently and a failure is simply omitted.
const account_28d = {};
for (const metric of ['reach', 'views', 'profile_views', 'accounts_engaged',
                      'total_interactions', 'follows_and_unfollows']) {
  try {
    const r = await graph(env, `${account.id}/insights`, {
      params: {metric, period: 'day', metric_type: 'total_value', since: since28(), until: nowUnix()},
    });
    const v = r.data?.[0];
    if (v) account_28d[metric] = v.total_value?.value ?? v.values?.[0]?.value ?? null;
  } catch { /* metric unsupported on this account — fine */ }
}
function nowUnix() { return String(Math.floor(now.getTime() / 1000)); }
function since28() { return String(Math.floor(now.getTime() / 1000) - 28 * 86400); }

// ---------- per-post ----------
const METRICS = 'views,reach,likes,comments,shares,saved,total_interactions';
let media = {data: []};
try {
  media = await graph(env, `${account.id}/media`, {
    params: {
      fields: 'id,caption,media_type,media_product_type,timestamp,permalink,thumbnail_url',
      limit: String(limit),
    },
  });
} catch (e) {
  console.error(`media list failed: ${e.message}`);
}

const posts = [];
for (const m of media.data || []) {
  const i = {};
  try {
    const r = await graph(env, `${m.id}/insights`, {params: {metric: METRICS}});
    for (const x of r.data) i[x.name] = x.values?.[0]?.value ?? 0;
  } catch { /* insights lag on brand-new media, and some types have none */ }
  const caption = m.caption || '';
  posts.push({
    id: m.id,
    posted_at: m.timestamp || null,
    age_h: m.timestamp ? Number(((now - Date.parse(m.timestamp)) / 3.6e6).toFixed(2)) : null,
    type: m.media_product_type || m.media_type || null,
    hook: caption.split('\n')[0].slice(0, 90),
    permalink: m.permalink || null,
    views: i.views ?? 0,
    reach: i.reach ?? 0,
    inter: i.total_interactions ?? 0,
    likes: i.likes ?? 0,
    comments: i.comments ?? 0,
    shares: i.shares ?? 0,
    saves: i.saved ?? 0,
  });
}

const sum = (k) => posts.reduce((a, p) => a + (p[k] || 0), 0);
const totals = {
  posts: posts.length,
  views: sum('views'),
  reach: sum('reach'),
  inter: sum('inter'),
  likes: sum('likes'),
  comments: sum('comments'),
  shares: sum('shares'),
  saves: sum('saves'),
};
totals.eng_rate = totals.reach ? Number(((totals.inter / totals.reach) * 100).toFixed(2)) : null;
totals.view_per_reach = totals.reach ? Number((totals.views / totals.reach).toFixed(3)) : null;

const out = {
  platform: 'instagram',
  generated_at: now.toISOString(),
  account,
  account_28d,
  totals,
  posts,
};

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

// ---------- rolling history ----------
// stats.json is a snapshot; this is the trend line. One compact row per run.
const row = {
  t: now.toISOString(),
  followers: account.followers ?? null,
  media_count: account.media_count ?? null,
  reach_28d: account_28d.reach ?? null,
  views_28d: account_28d.views ?? null,
  profile_views_28d: account_28d.profile_views ?? null,
  recent: {n: totals.posts, views: totals.views, reach: totals.reach, inter: totals.inter},
};
appendFileSync(HIST, JSON.stringify(row) + '\n');
const lines = readFileSync(HIST, 'utf8').trim().split('\n');
if (lines.length > HIST_MAX) writeFileSync(HIST, lines.slice(-HIST_MAX).join('\n') + '\n');

console.log(`stats.json written — ${posts.length} posts, ${totals.reach} reach, followers ${account.followers ?? '?'}`);

// ---------- optional human view ----------
if (has('--print')) {
  const pad = (s, n) => String(s).padEnd(n);
  const lp = (s, n) => String(s).padStart(n);
  console.log('');
  console.log(pad('POSTED', 17) + pad('HOOK', 44) + lp('VIEWS', 8) + lp('REACH', 8) + lp('ENG%', 7));
  console.log('-'.repeat(84));
  for (const p of posts) {
    console.log(
      pad((p.posted_at || '').slice(0, 16).replace('T', ' '), 17) +
      pad(p.hook.slice(0, 42), 44) + lp(p.views, 8) + lp(p.reach, 8) +
      lp(p.reach ? ((p.inter / p.reach) * 100).toFixed(1) : '-', 7)
    );
  }
  console.log('-'.repeat(84));
  console.log(pad(`TOTAL (${totals.posts})`, 61) + lp(totals.views, 8) + lp(totals.reach, 8) + lp(totals.eng_rate ?? '-', 7));
  console.log('');
}
