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
