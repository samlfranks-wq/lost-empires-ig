# TikTok posting log — @lostempiresai

> **READ THIS FIRST.** This log is hand-maintained and its early entries use
> shorthand topic names that do NOT match the video's hook line — e.g. "Toys"
> = the Victorian medical device myth-bust, "Congress/impotence" = the 17th-c
> French impotence trial. **Never conclude something is unposted by grepping
> this file.** Audit the ground truth instead:
>
> ```
> cd ~/.claude/projects/C--Users-samlf-Desktop-Claude
> python -c "import json,glob;[print((json.loads(l).get('timestamp') or '')[:10], c.get('input',{}).get('title','')[:70]) for f in glob.glob('*.jsonl') for l in open(f,encoding='utf-8',errors='ignore') if 'tiktok_publish' in l for c in ((json.loads(l).get('message') or {}).get('content') or []) if isinstance(c,dict) and c.get('type')=='tool_use' and c.get('name','').endswith('tiktok_publish')]"
> ```
>
> That reconstructs every real publish call. Doing this on 2026-08-18 caught a
> triple-post that this log had hidden.

There was no record of what had gone to TikTok until 2026-08-13. That gap is why
the account's biggest Instagram hits (73k, 29k, 11.7k views) sat unposted here
for six weeks while newer, weaker videos went out. **Append to this file on every
TikTok post.**

Publishing runs through Higgsfield MCP (`tiktok_*`), connector
`a8fb71c8-ac0b-48e2-a20a-c75b656eccc1`. Quotas: 5 posts/minute, 13/24h, both
rolling. Covers cannot be changed after posting — bake before publishing.

## 2026-07-31 — first batch (13 attempts, 12 posted)

Kings stickman · Kings pastel · Phryne watercolor v2 · Phryne fairy tale v2 ·
Rasputin stickman · Rasputin pastel · Toys stickman · Toys paper · Catherine ·
Congress/impotence · Cleopatra · Julie d'Aubigny

**Pompeii FAILED** — daily limit (13/24h) reached. Never re-posted; at 257 IG
views it isn't worth a slot.

## 2026-08-03

Genghis Khan ("Born in a tent, with nothing")

## 2026-08-06 — re-cuts

Rasputin re-cut · Toys re-cut · Kings re-cut · Agent GARBO stickman

## 2026-08-13 — back-catalogue recovery

The account's proven Instagram winners from June/early July, none of which had
ever been on TikTok. Sources: Instagram `media_url` where available, local
renders otherwise. All re-covered and cover-baked before upload.

Settings for the whole batch: public, comments/duet/stitch on, `is_aigc` true,
no commercial disclosure, track "ominous" by insensible
(`song_clip_id 7299620231882033153`) at music 12 / original 100.

| # | Video | IG views | Cover source |
|---|---|---|---|
| 1 | Viking divorce law | 73,116 | IG cover (25 Jul repost) |
| 2 | Wannsee | 29,261 | frame @1s, headline already burned in |
| 3 | Operation Mincemeat | 11,707 | **new hook drawn** — IG cover was textless |
| 4 | Göring / Nuremberg | 9,252 | frame @1s |
| 5 | English women / Vikings | 4,352 | **new hook drawn** — IG cover was textless |
| 6 | Stamford Bridge | 3,177 | **new hook drawn** — original text too small |
| 7 | Ancient Egypt bug spray | 2,415 | IG cover, recentred (headline at top) |
| 8 | Viking women's rights | 1,855 | frame @1s, recentred (headline at bottom) |
| 9 | Pirates / Caesar | 1,007 | **new hook drawn** — IG cover was textless |

### Cover gotchas found this run

- These older videos use **word-by-word captions**, so frame 1 lands mid-word
  ("PHARAOHS", "PREFERRED", "COULDN'T"). There is often no full-headline frame —
  four covers had to be drawn from scratch with `mkcover.sh`.
- `ffmpeg`'s `drawtext` **segfaults** on this box unless you pass an explicit
  `fontfile=` (fontconfig is broken). `C\:/Windows/Fonts/ariblk.ttf` works.
- Headline text wider than 1080px is silently cut off at both edges. `mkcover.sh`
  auto-shrinks the font to fit; check the grid preview anyway.
- **`tiktok_cover.sh` has a bug**: it clamps `crop_top_y` using the *source*
  height, not the scaled height. A 720x1280 thumb clamps to y=200 instead of 840,
  silently cropping away a bottom headline. Pre-scale the thumb to 1080x1920
  first, or pass a source that is already 1080 wide.
- Always render the 1:1 centre crop (`crop=1080:1080:0:420`) and **look at it**
  before baking. That check caught three broken covers in this batch.

### Publish IDs (2026-08-13)

| Video | publish_id | status |
|---|---|---|
| Viking divorce law | v_pub_url~v2.7673624453951260705 | PUBLISH_COMPLETE (post 7673624800627133728) |
| Wannsee | v_pub_url~v2.7673624514667841569 | PUBLISH_COMPLETE (post 7673624902754110752) |
| Mincemeat | v_pub_url~v2.7673624514667956257 | published |
| Göring | v_pub_url~v2.7673624733123905568 | published |
| English women | v_pub_url~v2.7673624733124102176 | published |
| Stamford Bridge | v_pub_url~v2.7673624956357330977 | published |
| Egypt | v_pub_url~v2.7673624956357363745 | published |
| Viking women | v_pub_url~v2.7673624847032846369 | published |
| Pirates | v_pub_url~v2.7673624847033075745 | processing at time of writing |

Working files (covers, baked videos, mkcover.sh) were in the session scratchpad —
`mkcover.sh` is worth keeping if this comes up again.

## 2026-08-16 — Wojtek v4 (sync fix)

Re-cut of the Wojtek story. v3 had a picture/narration desync: the `--cuts`
values were taken from the pause map sorted by LENGTH, which are not the
sentence boundaries — the Monte Cassino line landed 4.8s before the Monte
Cassino clip. v4 recuts on the real boundaries (found by transcribing the
render and reading the gaps between segments) and uses all six clips; `03.mp4`
(enlistment/salute at the docks) had been left out of v3 entirely.
Also `--ambient 0` — Kling clips ship their own soundtrack, peaks to -2.1 dB.

| Field | Value |
|---|---|
| File | `wojtek-short/wojtek_v4_cover.mp4` (44.64s, -13.8 LUFS) |
| CDN | `https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/e571b3b1-aa0e-418b-a773-8329d4e37bfd.mp4` |
| Instagram | trial reel (MANUAL) — https://www.instagram.com/reel/DcHEgLBCrlq/ |
| TikTok publish_id | v_pub_url~v2.7674692363071129632 |
| Music | "Moment Of Reflection" (7539149620821362689), vol 12 / original 100 |
| Cover | `thumbnails/wojtek_v3_thumb.jpg` (never previously published) |

## 2026-08-18 — Wojtek v6 (regenerated opener + textless bait)

First Wojtek build with NEW footage. v2/v4/v5 all deleted by Sam first, so
there was nothing on the account left to match against — see
`feedback_bait_only_on_unpublished`.

| Field | Value |
|---|---|
| IG | trial reel (MANUAL) — https://www.instagram.com/reel/DcLL1skFRyy/ |
| TikTok publish_id | v_pub_url~v2.7675285059246704672 |
| Music | "Moment Of Reflection" (7539149620821362689), vol 12 / original 100 |
| Files | `wojtek_v6.mp4` 33.21s (IG) / `wojtek_v6_tiktok.mp4` 33.35s (baked cover) |
| Cover | `thumbnails/wojtek_v6_bait_thumb.jpg` — frame from the BAIT clip, not the history footage |

Three changes vs v4, all deliberate:
1. **New opener** — `clips/hookB.mp4`, bear in uniform lunging at camera
   (nano_banana_2 -> kling3_0_turbo, 5s). Plain tunic, no insignia, no
   cross-shaped anything; audited on rendered frames per
   `feedback_ww2_iconography`.
2. **VO 44.4s -> 31.4s** via `compress_pauses.py` — silences shortened, speech
   samples untouched. Density 60% -> 85%. NOT a speech-rate change.
3. **Textless axe bait**, 1.66s, cutting on the descent. Cover taken from the
   bait clip at t=4.20 (the frame where the blade actually reads as an axe —
   the true opening frame crops to just a boulder in TikTok's 1:1 grid window).

Cover deviates from the skill's "cover always from history footage" rule on
Sam's explicit instruction. Baking a bear cover in front of an axe bait
cancels the bait, which is the whole point of the build.

## 2026-08-18 — Myth-bust (Victorian device) — TikTok back-catalogue

The account's only genuine share-driven breakout on Instagram (1,634 reach,
29.4s watch, 13 shares = 8.57 sh+sv per 1k, vs 1.5-2 per 1k for the
algorithmically-served posts). Posted to IG 2026-08-02; had never been on
TikTok — the 2026-08-13 back-catalogue batch missed it.

| Field | Value |
|---|---|
| TikTok publish_id | v_pub_url~v2.7675408449689667617 |
| Source | IG CDN (queue.json item 6), re-covered + baked |
| File | `mythbust-tiktok/mb_tiktok.mp4` 45.06s |
| Music | "Moment Of Reflection" (7539149620821362689), vol 12 / original 100 |

**Cover needed recentring** — the original IG cover puts "THIS WAS A MEDICAL
DEVICE" at the bottom, which TikTok's 1:1 grid window cut to "THIS WAS A".
`tiktok_cover.sh <src> <out> 840` fixed it; full headline now reads in the grid.

**Guideline note:** the burned-in caption at t=2s reads "THE VIBRATOR". Visuals
are entirely comedic (gourd, stone fragments, steam contraption) with nothing
explicit. Kept the term out of the TikTok title, the hashtags and the cover —
title says "Victorian medical device". Low but non-zero moderation risk; worth
checking whether this one gets distribution-capped vs its IG performance.

**!! CORRECTION (same day) — THIS WAS A DUPLICATE. DO NOT COUNT IT AS NEW.**
Audit of actual `tiktok_publish` calls across all session transcripts shows this
video had ALREADY been posted to TikTok on **2026-07-31** and again on
**2026-08-06**, under the title "Three things everyone repeats about this. All
three are false." Today's upload is the THIRD. It should be deleted.

The mistake: the 2026-07-31 entry below lists this video in shorthand as
**"Toys stickman / Toys paper"** — "Toys" is this Victorian-device video. Reading
the log for the words "three things" returned nothing and I wrongly concluded it
had never been posted.

Also already on TikTok, contrary to what was briefly claimed:
- Rasputin myth-bust ("three things everyone believes about how Rasputin died") — 2026-08-13
- "The most repeated fact on this subject has no ancient source at all" — 2026-07-31
- Wojtek — 2026-08-13, BEFORE v4 (08-16) and v6 (08-18); TikTok now holds three Wojteks

NOT re-posted to Instagram - it is already live there.

## 2026-08-22 — Chastity belts / Konrad Kyeser

First build from `fastcut.py` (explicit shot list) rather than `vo_first.py`.
Arm A of the animation A/B — see `hook-log.csv` rows chastity-kyeser-ig and
aud-brokaaud-ig.

| Field | Value |
|---|---|
| TikTok publish_id | v_pub_url~v2.7676780263971719200 |
| File | `chastity-short/chastity_tiktok.mp4` 49.23s |
| Music | "Moment Of Reflection" (7539149620821362689), vol 12 / original 100 |
| Cover | shocked-woman face + Impact title, baked frame 0 |
| Instagram | queued for 18:00 same day via queue.js (trial reel, MANUAL) |

24 shots, avg 2.05s, 8 of them Kling clips (33% animated). VO at natural rate,
Orion, only a single 8.9s seed_audio artefact gap clamped - no uniform pause
compression. Script rebuilt around a named protagonist (Kyeser) after the first
draft read as a factlist and Sam rejected it.

**seed_audio reliability note:** 2 of 4 takes came back with a huge artefact
pause (5.2s and 8.9s) mid-script. Always run `vo_first.py --analyse-only` on a
fresh take and look at the longest pause before building.

## 2026-08-22 — Procopius / the Secret History

| Field | Value |
|---|---|
| TikTok publish_id | v_pub_url~v2.7676883307648485409 (PUBLISH_COMPLETE) |
| File | `procopius-short/procopius_tiktok.mp4` 49.47s |
| Music | "Moment Of Reflection" (7539149620821362689), vol 12 / original 100 |
| Cover | Theodora portrait + Impact title, baked frame 0, verified full-opacity |
| Instagram | queued 2026-08-26 18:00 (trial reel, MANUAL) |

27 shots, avg 1.83s, 30% animated. First build to use the new toolkit end to end:
`vo_check.py` -> `shotlist.py` -> `names.json` -> `fastcut.py` -> `autoframe.py`.

**vo_check paid for itself immediately:** take 1 came back with a 7.69s dead gap
at 16.1s and was rejected before any clip credits were spent. Take 2 passed at
48.7s / 75.9% density. That is 3 artefact takes out of 6 - seed_audio fails this
way roughly half the time, so gate every take.

Framing note: the video is ABOUT the source, not a retelling of the lurid
Theodora claims. Those come from hostile polemic, so the script says so. Same
myth-bust shape that is working, and it keeps the account honest.

## 2026-08-22 — Louis XIV's surgery (FRENCH MUSIC TEST)

First video built to the 2026-08-22 competitor scrape: royalty category (their
2.2x baseline) at 43.4s (their top-four sit at 41-44s).

| Field | Value |
|---|---|
| TikTok publish_id | v_pub_url~v2.7676917815739484193 |
| File | `louis-short/louis_tiktok.mp4` 43.57s |
| Music | **"Sunset Lover" - Petit Biscuit** (7473899426799716369), vol 12 / original 100 |
| Cover | king biting a leather strap + Impact title, baked frame 0 |
| Instagram | NOT yet queued - next free slot is 2026-08-27 |

22 shots, avg 1.97s, 30% animated, **zero repeated sources** (Sam's new rule -
every image and clip used exactly once).

**Music note:** TikTok's CML has no French-language or French-genre filter.
`country_code: FR` returns the same largely global library, just ranked by what
trends in France. The closest available to "French music" is a track BY a French
artist - Petit Biscuit, French electronic producer. Do not promise chanson or
accordion; it is not in the library.

**Two production traps caught this build:**
1. `nano_banana` renders "surgeon" as a MODERN surgeon - blue/green scrubs,
   surgical cap, trainers - even in a 1686 scene. Two images had to be redone
   with explicit period dress ("long dark brown wool coat, cravat, knee breeches,
   periwig... absolutely NO scrubs, NO surgical cap"). Always check.
2. The `names.json` dictionary needs word FORMS, not just lemmas: PRACTICED was
   caught but PRACTICING slipped through. Add every inflection.

- 2026-08-23  Messalina (TikTok) - v_pub_url~v2.7677172886645606432 - 42.5s, Trailerhead 'Tales of the Electric Romeo' @12/100, IG queued 28th
- 2026-08-23  Bonnie Blue / Messalina v2 (TikTok) - v_pub_url~v2.7677188679198197792 - 45.9s, Livia VO, ALL-NEW footage (not a recut), Trailerhead "Glory Seeker" @12/100, IG queued 29th
- 2026-08-23  Medieval purity / back door (TikTok) - v_pub_url~v2.7677188699205044257 - 40.2s, 100% animated, NARU "Lofi nostalgic old music box" @12/100, IG queued 30th
- 2026-08-23  Broka-Audr / divorced for trousers (TikTok) - v_pub_url~v2.7677190505968683040 - 51.9s, BCD Studio "Nirvana" @12/100, IG queued 24th
- 2026-08-23  Mary Toft / rabbit births (TikTok) - v_pub_url~v2.7677190600931772448 - 50.7s, kai "Soft piano lo-fi" @12/100, IG queued 25th

## 2026-08-23 — Roman emperors' worst nights (2D carousel reel)
- Video: 27s, 1080x1920, silent render from `empire-carousel/render-empire.mjs` (spec-emperors-2d.json)
- CDN: https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/e71caac5-48f1-4964-a065-e8c27113132e.mp4
- Title: "Four Roman emperors. Four nights Rome never forgave. And one of them probably never happened."
- Music: "Tales of the Electric Romeo" — Trailerhead (song_clip_id 6783960722171758593), vol 100, trimmed 0–27000ms.
  Sam asked for "something from Gladiator" — not in the Commercial Music Library and there is no keyword search;
  Trailerhead is the closest cleared equivalent. Original video volume 0 (there is no audio track at all).
- is_aigc TRUE (nano_banana art). The ARCHIVAL variant of this deck was NOT posted to TikTok — Sam chose 2D only.
- publish_id v_pub_url~v2.7677276408321951776

## 2026-09-06 — Napoleon 1812 (Cowork map format, first map video on TikTok)

| Field | Value |
|---|---|
| TikTok publish_id | v_pub_url~v2.7682526892200773665 |
| File | `napoleon-1812/napoleon_v2.mp4` 58.0s, 1080x1920, 30fps, -14.1 LUFS |
| CDN | https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/ea46f290-2c55-4e88-9221-d6217214e813.mp4 |
| Music | "Invictus" — Trailerhead (6739976214024292354), vol 12 / original 100 |
| Cover | baked frame 0 — NAPOLEON / 600,000 IN / 10,000 OUT; verified against the 1:1 grid crop |
| is_aigc | **false** (standing rule) |
| Also queued | IG trial reel 12 Sep 18:00, YouTube 10 Sep |

Source render came from Cowork (`~/Downloads/LostEmpires_Napoleon1812Russia.mp4`, 62.5s). Three
fixes before publishing, all on the file: cut the 4.4s Subscribe tail (its end card had the handle
wrong as `@LOSTEMPIRES.AI`), rebuilt the frame-0 card (it said 100,000 OUT against the video's own
closing stat of 10,000), and normalised -15.4 LUFS / -0.2 dBTP to -14.1 / -1.0.

**Still wrong in the published cut, could not be fixed on the file:** yellow highlight words in the
captions (white-only rule), and the opening line withholds the payload until 50.8s. Both need a
Cowork re-render. Also the VO says the River Niemen as NAY-men; it is NEE-men.

## 2026-09-07 — Roman concrete + Pompeii re-edit (Cowork renders)

| | Roman concrete | Pompeii re-edit |
|---|---|---|
| publish_id | v_pub_url~v2.7682740423785285664 | v_pub_url~v2.7682740541187983392 |
| File | `roman-concrete/concrete_v2.mp4` 22.4s | `roman-concrete/pompeii_v2.mp4` 35.7s |
| Cover | ROMAN CONCRETE / HEALS ITSELF | POMPEII / WIVES BOUGHT GLADIATORS |
| Music | "Invictus" — Trailerhead (6739976214024292354), vol 12 / original 100 | same |
| is_aigc | false | false |
| Also queued | IG 13 Sep, YT 11 Sep | IG 14 Sep, YT 12 Sep |

Both from Cowork. Claude cut the "Follow for more Lost Empires" tails, added frame-0 title
cards and normalised to -14 LUFS.

**Published with known defects, on Sam's explicit instruction after being shown them:**
- **Watermark reads `@lost.empires` on every frame. The account is `@lostempiresai`.** A blur-and-
  redraw repair was tested and leaves a visible rectangle on flat backgrounds, so it shipped as-is.
  Fix the watermark in the Cowork template — it affects every future render.
- Yellow highlight words in the captions (MISTAKE, SEALS, PLAYGROUND) — white-only rule.
- Roman concrete has a compositing fault: source images do not fill 1080x1920, leaving a hard seam
  and black/grey bands, visible on frame 0.

**Pompeii was already live on Instagram** (2 posts on 4 Sep: 1,073 and 297 views) and YouTube.
It had never been on TikTok — the 2026-07-31 batch hit the daily cap before reaching it — so
TikTok is the one clean platform for it. The IG re-post carries a new hook and cover
("wives bought gladiators" rather than "Rome's playground") to reduce duplicate matching.

## 2026-09-07 — Mongol empire (map pipeline, built locally)

| Field | Value |
|---|---|
| publish_id | v_pub_url~v2.7682797457331374113 (post 7682797722390383904) |
| File | `_mongol_tiktok.mp4` 60.43s — cover baked over the first 1.4s |
| Cover | THE MONGOLS / 4x BIGGER THAN ROME; verified against the 1:1 grid crop |
| Music | "Invictus" — Trailerhead (6739976214024292354), vol 12 / original 100 |
| is_aigc | false |
| Also queued | IG 16 Sep (trial reel), YouTube 14 Sep |

First video rendered end-to-end on Sam's own machine rather than in Cowork: Kokoro
am_fenrir VO, leader portraits (Genghis, Batu) from public-domain Wikimedia images, and
the FOLLOW end card with the click animation.

**Rome timelapse is the pair to this and is NOT yet on TikTok.** Prepped and waiting at
`Desktop/Lost Empires - map videos/TIKTOK TONIGHT - Rome (cover baked).mp4`, with a
scheduled reminder set for 19:00 local on 7 Sep.

## 2026-09-15 — cross-posts that had never been on TikTok

Found by auditing real `tiktok_publish` calls (59 distinct videos) against both
publisher queues. Every map video was already up; these two were Sam's own
YouTube shorts, cross-posted to Instagram on 10/11 Sep and never to TikTok.

| | Roman leg day | Bronze Age collapse |
|---|---|---|
| publish_id | v_pub_url~v2.7685669589216184352 | v_pub_url~v2.7685669995732617248 |
| Duration | 30.1s (inside the 24-32s TikTok band) | 42.2s |
| Cover | frame 0 already a full-opacity title card | **frame 0 was BLACK** — cover baked on as 0.33s |
| is_aigc | false | false |
| Music | none — both carry their own VO | none |

**Roman leg day ships with YELLOW hook text** ("ROMAN GYM GIRL", "YEARS OLD"),
against the white-only rule. Not fixed: it is already published on IG and
YouTube in that form, and re-rendering shipped video for a cosmetic defect is
its own standing rule. Fix it at the source if this format gets rebuilt.

**Higgsfield `media_confirm` was down 14-15 Sep** — five consecutive failures
across two days and two fresh uploads. It recovered on the morning of the 15th.
While it was down an unconfirmed object was served inconsistently by CloudFront
(200 from one edge, 403 from another), which is what Instagram rejected on the
14th. Pompeii was rehosted on catbox to get round it.

## 2026-09-14/15 — four posts that were published but never logged here

Backfilled 16 Sep from the session transcripts (real `tiktok_publish` calls). All
`is_aigc` false, no music, own VO. Found while auditing the queue for TikTok gaps.

| Date (UTC) | Video | publish_id | Also on |
|---|---|---|---|
| 14 Sep 14:10 | Celtic Europe (map pipeline, celtic_base) | v_pub_url~v2.7685392870240634912 | IG 27 Sep, YT 27 Sep |
| 14 Sep 15:08 | US territorial expansion (political basemap, reworked camera) | v_pub_url~v2.7685408022381955104 | IG 24 Sep, YT 24 Sep |
| 15 Sep 08:51 | Ottoman Empire 1299-1923 (map pipeline) | v_pub_url~v2.7685681431926016033 | IG 29 Sep, YT 28 Sep |
| 15 Sep 21:37 | Spartan school / agoge (Sam's YT short) | v_pub_url~v2.7685878707663423520 | IG 9 Sep, YT (Sam) |

## 2026-09-16 — Alexander the Great (map pipeline, first "Google Earth" tier build)

| Field | Value |
|---|---|
| publish_id | v_pub_url~v2.7685951699881789472 |
| File | `map-pipeline/alexander/alexander_FINAL.mp4` 71.0s, 3.3 Mbps, -14.0 LUFS |
| CDN | https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/5031ca58-943a-4425-9b95-877f82d2c63c.mp4 (confirmed) |
| Cover | baked frame 0 — Vergina Sun badge, ALEXANDER THE GREAT / NEVER LOST A BATTLE |
| Caption | Alexander the Great never lost a battle and built the largest empire the world had seen. He was dead at 32. #history #alexanderthegreat |
| Music | none — own VO and score |
| is_aigc | false (standing rule) |
| Also queued | IG 2 Oct 17:00Z, YouTube 1 Oct 18:00Z (queued 16 Sep) |

First build with the satellite plate (NASA Blue Marble), the fly-to camera
(pull-back / bank / push-in transits, 10 deg tilt), and animated sprite characters
(Alexander rides the route tip; Darius flees at Issus and Gaugamela; the army sits
down at the Beas). Motion p90 12.69px - inside Knowledgia's band for the first time.
Mechanics and the traps hit are in `map-pipeline/CLAUDE.md`.

Spend: ~0.6cr VO (Alden, one take) + ~4.5cr for three nano_banana stickers.

## 2026-09-16 — Hannibal (second Alexander-tier build; the tier is now the default)

| Field | Value |
|---|---|
| publish_id | v_pub_url~v2.7685960726078588961 |
| File | `map-pipeline/hannibal/hannibal_FINAL.mp4` 80.7s, 2.9 Mbps, -14.0 LUFS |
| CDN | https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/e3357afa-0a6f-4165-af76-b4c1875b605e.mp4 (confirmed) |
| Cover | baked frame 0 — sign of Tanit badge, HANNIBAL / NEVER TOOK ROME |
| Caption | Hannibal marched 37 elephants over the Alps to attack Rome. He won every battle for 15 years and never took the city. #history #hannibal |
| Music | none — own VO and score |
| is_aigc | false (standing rule) |
| Also queued | IG 3 Oct 17:00Z, YouTube 2 Oct 18:00Z (queued 16 Sep) |

Sam set the Alexander cut as the template this morning ("i love it, set this style as
the new template moving forward"). Hannibal is the first build under that default:
satellite plate, fly-to camera, 10 deg tilt, route as geometry, three stickers
(Hannibal rides the elephant over the Alps; a legionary runs at each battle; Scipio
waits at Zama). Motion p90 3.59px - lower than Alexander's 12.69 because the
geography is compact and the flights short, not a camera regression.

New trap for the template: the fly-to pull-back must be capped on BOTH axes. This
plate is 38 deg wide and the long flights clamped ~3 deg sideways until a longitude
cap went in. And never place a label at a leg's endpoint - that is where the rider
parks. Both are in map-pipeline/CLAUDE.md.

Spend: ~0.6cr VO + ~4.5cr stickers.

## 2026-09-16 — Rome vs Germania (Alexander tier; first build on the 120 px/deg plate)

| Field | Value |
|---|---|
| publish_id | v_pub_url~v2.7686251401118320672 |
| File | `map-pipeline/germania/germania_FINAL.mp4` 76.4s, 3.0 Mbps, -14.0 LUFS |
| CDN | https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/486dba74-90bc-4434-abac-733ac2661c46.mp4 (confirmed) |
| Cover | baked frame 0 — SPQR badge, ROME / NEVER TOOK GERMANY |
| Caption | Rome took Gaul in 8 years. It spent 30 on Germania, lost three legions in a forest, and never tried again. #history #rome #germania #map |
| Music | none — own VO and score |
| is_aigc | false (standing rule) |
| Also queued | IG 5 Oct 18:00 London, YouTube 4 Oct 19:00 London - the FIXED master germania_FINAL_v2.mp4, not this cut (queued 17 Sep) |

Shipped with three cosmetic overlaps (THE ELBE label under the rider for ~3s, TEUTOBURG
FOREST label behind the ambush sprites, Arminius sprite over the FOLLOW card) because
the no-re-render rule says cosmetics don't hold a post. The re-render with those fixed
is the file to use for IG/YT. Built in the same session as Sparta and the Anglo-Saxons;
the mechanics are in map-pipeline/CLAUDE.md ("Three builds at once").

Spend: ~0.6cr VO + ~4.5cr stickers.

## 2026-09-16 — Why Sparta Collapsed (Alexander tier, 120 px/deg plate, collision-checked)

| Field | Value |
|---|---|
| publish_id | v_pub_url~v2.7686255796602030112 |
| File | `map-pipeline/sparta/sparta_FINAL.mp4` 77.3s, 2.0 Mbps, -14.0 LUFS, cover held 1.0s |
| CDN | https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/61b047a8-58d6-4792-a25f-20a42d78316c.mp4 (confirmed) |
| Cover | baked frame 0-29 — lambda shield badge, SPARTA / RAN OUT OF SPARTANS |
| Caption | Sparta beat Athens, ruled Greece, and was finished in 30 years. It ran out of Spartans. #history #sparta #ancientgreece #map |
| Music | none — own VO and score |
| is_aigc | false (standing rule) |
| Also queued | IG 4 Oct 18:00 London, YouTube 3 Oct 19:00 London (queued 17 Sep) |

First video through `check_sprites.py` (Sam: "make sure animations dont overlap badly
with map text") - the first pass found 13 sprite-on-label overlaps that every other
gate had passed. First video with the one-second cover hold (Sam wants to pick the
YouTube frame from the first second). Motion p90 1.41px: the Aegean is black on the
satellite plate and gives the phase correlator nothing to lock on, so the meter
under-reads on this geography.

Spend: ~0.6cr VO + ~4.5cr stickers.

## 2026-09-16 — The Anglo-Saxons come to Britain (Alexander tier, 120 px/deg plate, collision-checked)

| Field | Value |
|---|---|
| publish_id | v_pub_url~v2.7686440783230076960 (REPOST 17 Sep 10:57 London; the 16 Sep post v_pub_url~v2.7686260089627510816 was deleted by Sam - three went out in 40 minutes) |
| File | `map-pipeline/saxons/saxons_FINAL.mp4` 76.5s, 3.0 Mbps, -14.0 LUFS, cover held 1.0s |
| CDN | https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/710675b5-892d-4630-a285-25c68d52e1c5.mp4 (confirmed) |
| Cover | baked frame 0-29 — Saxon round-shield badge, THE ENGLISH / AREN'T FROM ENGLAND |
| Caption | The English are not from England. They came by boat from Germany and Denmark and took the island in 200 years. #history #anglosaxons #england #map |
| Music | none — own VO and score |
| is_aigc | false (standing rule) |
| Also queued | IG 6 Oct 18:00 London, YouTube 5 Oct 19:00 London (queued 17 Sep) |

Third of the night's three builds (Sparta, Germania, Saxons). Motion p90 7.81px, the
highest of the three - the North Sea crossings are long flights. Germania's FIXED
master for IG/YT is `germania_FINAL_v2.mp4` (gofile.io/d/5SF10VTe); the TikTok cut
is the earlier file.

Spend: ~0.6cr VO + ~4.5cr stickers.

## 2026-09-17 — Alexander and Hannibal: fixed masters built for the IG/YT queue

Sam: "fix and re-render alexander and hannibal for the queue." Both failed
`check_sprites.py` when it was run retroactively (Alexander 3 overlaps, Hannibal 12 -
Scipio stood on CARTHAGE for 15.4s). Fixed by moving labels off leg endpoints
(PELLA, ISSUS, INDUS on Alexander; THE ALPS, TREBIA, TRASIMENE, CANNAE, ROME,
CARTHAGE on Hannibal) and shortening Scipio's Zama hold so he is gone before the
closing pull-back. Both re-rendered, one-second cover baked, decode clean, -14.0 LUFS.

Per the no-re-render rule the TikTok posts (already live, `v_pub_url~v2.7685952714328526113`
and `v_pub_url~v2.7685960726078588961`) are untouched. The IG/YT queue entries were
swapped to the new CDN URLs:

| | Old (TikTok, unchanged) | New (queue, fixed) |
|---|---|---|
| Alexander | .../5031ca58-943a-4425-9b95-877f82d2c63c.mp4 | .../009580c6-52b6-4082-959c-39f69f4badc9.mp4 |
| Hannibal | .../e3357afa-0a6f-4165-af76-b4c1875b605e.mp4 | .../47bf7732-7d82-4d53-a0ad-74bd128fa890.mp4 |

## 2026-09-18 — Why Didn't Japan Attack the Soviet Union (new build, widest plate yet)

| Field | Value |
|---|---|
| publish_id | v_pub_url~v2.7686646976397608993 |
| File | `map-pipeline/nomonhan/nomonhan_FINAL.mp4` 94.5s, 3.1 Mbps, -14.0 LUFS, cover held 1.0s |
| CDN | https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/0422961f-f168-46b9-809f-cd4c7d41e910.mp4 (confirmed) |
| Cover | baked frame 0-29 - Japan+Soviet two-flag badge, JAPAN / NEVER ATTACKED THE USSR |
| Caption | Japan built an army to invade the Soviet Union. It attacked once, lost in six weeks, and never tried again. #history #japan #ww2 #map |
| Music | none - own VO and score |
| is_aigc | false (standing rule) |
| Also queued | NOT yet on IG or YouTube |

Sam: "prepare a new map video focused on ww2 themes." Picked the single highest-scoring
unbuilt Knowledgia topic (4.5M) that also sidesteps the WW2 insignia rule entirely by
construction - Japan and the USSR, no German content anywhere. Widest plate the pipeline
has built (Manchuria to Moscow, 123 deg at 60px/deg). The closing Siberian-divisions-to-
Moscow journey is three separate flights rather than one, because Moscow's latitude
only allows an ~20 deg camera and a single 82-degree leap would have blown the vertical
clamp. Passed check_sprites.py after five label moves.

Caveat, disclosed rather than hidden: the Blue Marble source photo is a December
composite, so the whole plate shows snow cover even in the May/August 1939 beats,
which were fought in summer. Accurate for the December 1941 payoff, not season-true
for the earlier ones.

Also found while checking for TikTok gaps: an old-tier WW2 Germany video
(`ww2/ww2_tiktok.mp4`, built 7 Sep) was never posted. Frames are clean of insignia but
it runs 63.5s, well past the 24-32s band that performs here, and predates the current
tier. NOT posted - flagged to Sam instead of recut.

Spend: ~0.6cr VO + ~4.5cr stickers.
