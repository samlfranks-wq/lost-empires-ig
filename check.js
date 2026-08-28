// Read-only setup verification. Publishes NOTHING.
// Confirms the token works, finds your Instagram Business account ID, and
// reports how much of your publishing quota is left.
//
//   node check.js

import {loadEnv, graph} from './lib.js';

const env = loadEnv(['IG_ACCESS_TOKEN']); // IG_USER_ID is what we're discovering

console.log(`\n${env.GRAPH_HOST} ${env.GRAPH_VERSION}  (AUTH_MODE=${env.AUTH_MODE})\n`);

try {
  let found;

  if (env.AUTH_MODE === 'instagram') {
    // Instagram Login: the token belongs to the IG account directly, so the
    // account ID comes straight off /me — no Pages involved.
    const me = await graph(env, 'me', {
      params: {fields: 'user_id,username,account_type'},
    });
    found = {id: me.user_id || me.id, username: me.username};
    console.log(`✔ Token valid — @${found.username} (${found.account_type || 'account'})`);
  } else {
  // 1. Does the token work at all, and who does it belong to?
  const me = await graph(env, 'me', {params: {fields: 'id,name'}});
  console.log(`✔ Token valid — Facebook user: ${me.name} (${me.id})`);

  // 2. Which Pages can it see, and which have an Instagram account attached?
  const pages = await graph(env, 'me/accounts', {
    params: {fields: 'id,name,instagram_business_account{id,username}'},
  });

  if (!pages.data?.length) {
    console.log(
      '\n✖ No Facebook Pages visible to this token.\n' +
        '  Instagram publishing requires your IG account linked to a Page.\n' +
        '  Fix: Instagram app → Settings → Account type → switch to Business,\n' +
        '  then link it to a Facebook Page during that flow.'
    );
    process.exit(1);
  }

  for (const p of pages.data) {
    const ig = p.instagram_business_account;
    console.log(`  Page "${p.name}" (${p.id}) → ${ig ? `@${ig.username} [${ig.id}]` : 'no IG linked'}`);
    if (ig) found = ig;
  }

  if (!found) {
    console.log('\n✖ A Page was found but no Instagram Business account is linked to it.');
    process.exit(1);
  }
  }

  console.log(`\n✔ Instagram account: @${found.username}`);
  console.log(`  IG_USER_ID=${found.id}   ← put this in your .env`);

  if (env.IG_USER_ID && env.IG_USER_ID !== found.id) {
    console.log(`\n⚠ Your .env has IG_USER_ID=${env.IG_USER_ID}, which does not match. Update it.`);
  }

  // 3. Remaining publishing quota (Meta allows 25 API posts per rolling 24h).
  try {
    const q = await graph(env, `${found.id}/content_publishing_limit`, {
      params: {fields: 'quota_usage,config'},
    });
    const row = q.data?.[0];
    if (row) {
      const cap = row.config?.quota_total ?? 25;
      console.log(`\n✔ Publishing quota: ${row.quota_usage ?? 0}/${cap} used in the last 24h`);
    }
  } catch {
    console.log('\n(Could not read publishing quota — not fatal.)');
  }

  console.log('\nSetup looks good. Next: node post.js --url <video-url> --caption "..."\n');
} catch (err) {
  console.error(`\n✖ ${err.message}\n`);
  console.error(
    env.AUTH_MODE === 'instagram'
      ? 'Common causes:\n' +
        '  • Token expired — regenerate a long-lived token\n' +
        '  • Missing permissions — you need instagram_business_basic and\n' +
        '    instagram_business_content_publish\n' +
        '  • Account is still Personal — it must be Business or Creator\n'
      : 'Common causes:\n' +
        '  • Token expired — regenerate a long-lived token\n' +
        '  • Missing permissions — you need instagram_basic, instagram_content_publish,\n' +
        '    pages_show_list and pages_read_engagement\n'
  );
  process.exitCode = 1;
}
