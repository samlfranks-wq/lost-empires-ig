# Instagram Reel publisher

Publishes finished Reels to **@lostempiresai** straight from a public video URL
via Meta's Graph API. No file uploads, no browser, no quality loss — the same
CDN URL we already generate for every render is what gets published.

Zero npm dependencies. Node 18+ (you have v24).

---

## One-time setup

Steps 1–4 need your Meta login, so they're yours to do. Should take ~20 minutes.

### 1. Make the Instagram account a Professional account

Instagram app → **Settings → Account type and tools → Switch to professional
account** → choose **Creator** or **Business**.

Personal accounts cannot publish via API at all — this step is non-negotiable.

### 2. Create a Meta developer app

Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) →
**Create app** → choose the use case **"Manage messaging and content on
Instagram"**.

This is the *Instagram API with Instagram Login* path. It authenticates straight
against Instagram, so **no Facebook Page is required** — which removes the single
most failure-prone part of the old setup.

### 3. Generate a long-lived access token

In the app dashboard → **Instagram → API setup with Instagram login**:

1. Add your Instagram account under **Generate access tokens**
2. The permissions you need are:
   - `instagram_business_basic`
   - `instagram_business_content_publish`
3. Click **Generate token**, authorise, and copy it.

Tokens here are long-lived (~60 days) already — no Token Debugger step needed.

**You do not need Meta App Review.** App Review is only required to act on
*other people's* accounts. While your app is in Development mode you can publish
to accounts you have a role on — and you're the admin of your own app, posting to
your own account. This is the difference between "20 minutes" and "two weeks",
so don't let the review prompts scare you off.

### 4. Fill in `.env`

```bash
cp .env.example .env
```

Open `.env` and paste the token into `IG_ACCESS_TOKEN`. Leave `IG_USER_ID`
blank for now — the next step finds it.

> Put the token in the file yourself. Don't paste it into a chat window, and
> don't commit `.env`.

---

## Verify (publishes nothing)

```bash
node check.js
```

This confirms the token works, prints your `IG_USER_ID` to paste into `.env`,
and shows your remaining posting quota. Run it first — if anything in the setup
is wrong, this tells you exactly what.

> If you ever set up the older Page-linked route instead, set
> `AUTH_MODE=facebook` in `.env`. Everything else works identically.

---

## Publish

Dry run — stages and validates the video with Instagram, stops before going public:

```bash
node post.js --url "https://d2ol7oe51mr4n9.cloudfront.net/.../video.mp4" --caption "your caption #history"
```

Then publish for real by adding `--confirm`:

```bash
node post.js --url "https://d2ol7oe51mr4n9.cloudfront.net/.../video.mp4" --caption "your caption #history" --confirm
```

Hashtags are lowercased automatically. Caption limits (2200 chars, 30 hashtags)
are checked before anything is sent.

### Trial Reels

Add `--trial` to post to **non-followers only** — a way to test a hook without
spending it on your audience.

```bash
node post.js --url "..." --caption "..." --trial manual --confirm
```

- `--trial manual` — stays a trial until you graduate it yourself in the app
- `--trial performance` — Meta graduates it automatically if it performs well

**Graduating is not available via the API.** Once a trial reel does well, you
promote it to your followers from inside the Instagram app (Reel → ⋯ → share to
followers). Nothing here can do that step for you.

---

## Scheduled posting

Create `queue.json`:

```json
[
  {"at": "2026-08-01T18:00:00Z", "url": "https://.../cleo.mp4", "caption": "..."},
  {"at": "2026-08-03T18:00:00Z", "url": "https://.../cath.mp4", "caption": "..."}
]
```

```bash
node queue.js            # dry run — shows what's due
node queue.js --confirm  # publishes the one due item
```

Point Windows Task Scheduler at `node queue.js --confirm` hourly and it posts
unattended. It publishes **at most one item per run**, so a bad queue file can
never dump your whole backlog at once.

---

## Limits worth knowing

| | |
|---|---|
| Cost | **Free** — no charge for the API or for publishing |
| Rate limit | 25 API posts per rolling 24h (Reels and Stories share the bucket) |
| Reel length | 5–90 seconds for Reels-tab eligibility (ours are ~35–40s ✓) |
| Format | MP4/MOV, H.264 or HEVC, AAC audio, 9:16 (ours ✓) |
| Token expiry | ~60 days — rerun step 4 to refresh, or `check.js` will tell you it died |

## Gotchas

- **The video URL must be publicly reachable.** Instagram's servers fetch it
  directly; a localhost or auth-gated URL fails.
- **Token expiry is silent** until a call fails. If `queue.js` starts erroring
  after a couple of months, that's almost certainly why.
- **Bump `GRAPH_VERSION`** in `.env` if you hit a deprecation error. Meta retires
  versions after roughly two years.
