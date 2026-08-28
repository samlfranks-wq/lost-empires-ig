// Publish an image CAROUSEL to Instagram from public image URLs.
//
//   node post-carousel.js --urls urls.txt --caption-file cap.txt
//   node post-carousel.js --urls urls.txt --caption-file cap.txt --confirm
//
// Companion to post.js, which only does Reels. Same house rules: hashtags are
// lowercased, caption limits are checked up front, and without --confirm it
// does everything EXCEPT the final publish call — every child container is
// created and validated with Instagram, then it stops.
//
// Instagram's three-step carousel flow:
//   1. one container per slide, is_carousel_item=true
//   2. one CAROUSEL container listing those children + the caption
//   3. media_publish on the carousel container
//
// --urls takes a file with one public https image URL per line (2-10 of them,
// in slide order). Instagram's servers fetch each URL directly, so localhost
// and auth-gated links fail.

import {readFileSync} from 'node:fs';
import {loadEnv, graph, sleep, fail} from './lib.js';

const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1];
};
const urlsFile = arg('urls');
const captionFile = arg('caption-file');
const confirm = argv.includes('--confirm');

if (!urlsFile) fail('Missing --urls <file with one image URL per line>.');

const urls = readFileSync(urlsFile, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

if (urls.length < 2) fail(`A carousel needs at least 2 images; got ${urls.length}.`);
if (urls.length > 10) fail(`Instagram allows at most 10 carousel items; got ${urls.length}.`);
for (const u of urls) {
  if (!/^https:\/\//.test(u)) fail(`Not a public https URL: ${u}`);
}

const rawCaption = captionFile ? readFileSync(captionFile, 'utf8').trim() : (arg('caption') ?? '');
// House style: hashtags are always lowercase.
const caption = rawCaption.replace(/#[\w]+/g, (t) => t.toLowerCase());
if (caption !== rawCaption) console.log('· lowercased hashtags to match house style');
if (caption.length > 2200) fail(`Caption is ${caption.length} chars; Instagram allows 2200.`);
const tagCount = (caption.match(/#\w+/g) || []).length;
if (tagCount > 30) fail(`${tagCount} hashtags; Instagram allows 30.`);

const env = loadEnv();

// --- 1. one container per slide ---------------------------------------
console.log(`\nCreating ${urls.length} carousel item containers…`);
const children = [];
for (const [i, image_url] of urls.entries()) {
  const c = await graph(env, `${env.IG_USER_ID}/media`, {
    method: 'POST',
    params: {image_url, is_carousel_item: 'true'},
  }).catch((e) => fail(`slide ${i + 1} (${image_url})\n   ${e.message}`));
  console.log(`  ${String(i + 1).padStart(2, '0')}  ${c.id}`);
  children.push(c.id);
}

// Images are usually ingested synchronously, but poll anyway — publishing a
// child that is not FINISHED fails the whole carousel.
process.stdout.write('  ingesting');
for (const id of children) {
  for (let i = 0; i < 24; i++) {
    const s = await graph(env, id, {params: {fields: 'status_code,status'}});
    if (s.status_code === 'FINISHED') break;
    if (s.status_code === 'ERROR') fail(`Instagram rejected a slide: ${s.status || 'no detail'}`);
    await sleep(2500);
    process.stdout.write('.');
  }
}
console.log('\n✔ All slides accepted by Instagram.');

// --- 2. the carousel container ----------------------------------------
const carousel = await graph(env, `${env.IG_USER_ID}/media`, {
  method: 'POST',
  params: {media_type: 'CAROUSEL', children: children.join(','), caption},
}).catch((e) => fail(e.message));
console.log(`  carousel container: ${carousel.id}`);

// --- 3. publish (only on explicit confirmation) -----------------------
if (!confirm) {
  console.log(
    '\nDRY RUN — nothing was published.\n' +
      `All ${urls.length} slides are validated and staged. To publish, re-run with --confirm\n` +
      `(container ${carousel.id} expires in 24 hours).\n`
  );
  process.exit(0);
}

// The CAROUSEL container itself also has to finish ingesting — polling only the
// children is not enough. Publishing too early returns code 9007 "Media ID is
// not available", so wait for FINISHED and then retry the publish anyway; the
// status flips a beat before the publish endpoint actually accepts it.
process.stdout.write('  finalising');
for (let i = 0; i < 36; i++) {
  const s = await graph(env, carousel.id, {params: {fields: 'status_code,status'}}).catch(() => ({}));
  if (s.status_code === 'FINISHED') break;
  if (s.status_code === 'ERROR') fail(`Instagram rejected the carousel: ${s.status || 'no detail'}`);
  await sleep(5000);
  process.stdout.write('.');
}
console.log('');

let published = null;
for (let i = 0; i < 12; i++) {
  try {
    published = await graph(env, `${env.IG_USER_ID}/media_publish`, {
      method: 'POST',
      params: {creation_id: carousel.id},
    });
    break;
  } catch (e) {
    if (!/9007|not ready|not available/i.test(e.message) || i === 11) fail(e.message);
    if (i === 0) console.log('  not ready yet — retrying');
    await sleep(10000);
  }
}

const link = await graph(env, published.id, {params: {fields: 'permalink'}}).catch(() => null);
console.log(`\n✔ PUBLISHED — media id ${published.id}`);
if (link?.permalink) console.log(`  ${link.permalink}\n`);
