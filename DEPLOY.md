# Deploying the Instagram queue to GitHub Actions

Publishes one queued Reel per hour-check so the account keeps posting with
nobody at the laptop. Mirrors `lost-empires-yt` exactly — same shape, same rules.

## Setup (needs your GitHub login)

### 1. Create a PRIVATE repo and push

    cd ig-publisher
    git init && git add . && git commit -m "ig-publisher + scheduled publish workflow"
    git remote add origin git@github.com:samlfranks-wq/lost-empires-ig.git
    git branch -M main && git push -u origin main

**Private.** The queue holds your captions and posting schedule.

### 2. Add the secrets

Settings → Secrets and variables → Actions → *New repository secret*.
**One name, one bare value each — no `KEY=` prefix, no comment lines.**

| Secret | Value |
|---|---|
| `IG_USER_ID` | `17841426662257385` |
| `IG_ACCESS_TOKEN` | the long token from your local `.env` |
| `AUTH_MODE` | `instagram` |
| `GRAPH_VERSION` | `v23.0` |

### 3. Prove it before you fly

Actions → *Publish one Reel* → **Run workflow**. Expect "Nothing due" unless an
item is actually due — that is a pass, and it confirms the token works.

## The thing most likely to break: token expiry

`IG_ACCESS_TOKEN` is a **long-lived token that lasts 60 days** and does not
auto-refresh in this setup. If it expires mid-holiday, publishing stops silently
until you refresh it and update the repo secret.

Check remaining life any time with `node check.js` locally. If it is inside ~14
days of expiry, refresh before you travel.

## Behaviour

- Hourly at **:42** — deliberately offset from the YouTube repo's **:17** so the
  two never contend.
- One publish per run. `queue.js` takes the first entry whose `at` has passed
  with no `posted` stamp.
- The commit is the lock. If the push fails, the next run republishes the same
  Reel — check the account before re-running after a push failure.
- Instagram publishing quota is 100 posts / 24h. At one a day this is irrelevant.
- Scheduled workflows switch off after 60 days of repo inactivity.

## ⚠ Do not run both schedulers

The Windows task **"IG Publisher Queue"** also runs off the *local* queue.json.
Once Actions is live the two copies drift and the same Reel can post twice.

**Before you fly:**

    Disable-ScheduledTask -TaskName "IG Publisher Queue"

## ⚠ Never add a repost to this queue

44% of the last 80 posts reused a hook, and Instagram zeroed the reach on a
duplicate (Etruscans V2: 0 views on IG, 391 on TikTok the same day). Everything
currently queued is new to Instagram. Keep it that way.
