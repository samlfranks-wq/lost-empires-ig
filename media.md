# Media URLs

CDN base: `https://d2ol7oe51mr4n9.cloudfront.net/user_3E5kpoO7CXWYDEVasBRvd0P7wSt/`

## TikTok grid-safe versions (use these on TikTok)

TikTok's profile grid renders a **1:1 centre crop** of the 1080x1920 cover — the
top 420px and bottom 420px are invisible there. Our headlines sit outside that
window (bottom on the new batch, top on the older Remotion batch), so they were
being cut off on the profile page. `tiktok_cover.sh` rebuilds the cover so the
chosen 1080x1080 window lands dead centre; `bake_cover.sh` then bakes it in.

| Video | File | cover offset |
|---|---|---|
| Kings stickman | `fd656c22-3bd9-452b-9aa4-e73cbf2b0432.mp4` | 840 (headline at bottom) |
| Pompeii | `482d0079-0cfb-4ead-b873-c4fa3e2c74fc.mp4` | 0 (headline at top) |
| Dancing Plague | `1ef85bb2-23d1-4ed7-a04c-1193e1055b61.mp4` | 0 (headline at top) |

## Cover-baked versions (use these for TikTok)

The thumbnail is baked in as the first ~4 frames, because **TikTok's publish API
has no cover parameter for video** — it just takes frame 1. These files therefore
get the right cover on every platform. Built with `bake_cover.sh`.

| Video | File |
|---|---|
| Kings stickman | `2483eaaa-dee7-4f71-b377-51abebe2b610.mp4` |
| Kings pastel | `1aca9021-5955-43ad-ac56-fa47469e0814.mp4` |
| Rasputin stickman | `89263727-b0b8-462d-9d7f-c80c95b7c946.mp4` |
| Rasputin pastel | `69af58d4-6ebb-429e-af3b-eff896522eb0.mp4` |
| Phryne watercolor v2 | `b656e44f-63dc-4d33-8f9d-17c83a6bcd05.mp4` |
| Phryne fairy tale v2 | `3abb0bac-a23c-4687-a0ea-efa4750d6859.mp4` |

## Plain versions + separate covers (used by the Instagram queue)

Instagram takes `cover_url` as its own parameter, so these don't need the baked
frame. `queue.json` points at these — don't repoint it without re-testing.

| Video | Video file | Cover file |
|---|---|---|
| Kings stickman | `64ee6ddd-750f-4067-adfb-3e7e746d56ac.mp4` | `9f19cd8d-0d7b-4b78-8d2c-5aa6aefba4f7.jpg` |
| Kings pastel | `1fb7ea42-e805-4775-8f95-1c6991d0303d.mp4` | `405bcbd5-ef97-438c-ad00-f3a007318095.jpg` |
| Rasputin stickman | `22b6eb80-13ec-4ba2-820e-95818053ef65.mp4` | `2070cdf5-9ef7-4fa7-803e-e62a0934958a.jpg` |
| Rasputin pastel | `0505cb47-ae89-43e8-8f78-4726a488812c.mp4` | `ede29131-ecb8-4c74-b019-3070f1847aaa.jpg` |
| Phryne watercolor v2 | `2780c0ae-5240-452f-9734-9e79acf6576a.mp4` | `d8336b0c-fed9-40b6-a638-e07cbcffed7f.jpg` |
| Phryne fairy tale v2 | `5c362823-9939-4316-aa51-556c2c9134da.mp4` | `6eb4fc6d-4b58-4527-8f4b-d4c772876eaa.jpg` |

## Earlier batch (posted to Instagram 2026-07-30, cover baked by Remotion)

Cleopatra `b19dc078-82df-4030-a91f-9fbdc7429e1c` · Catherine `61c31e31-ca88-40e8-b810-37accd884caa` ·
Julie `1c1fcfce-3d47-4621-b198-7bd3ecea8fdb` · Dancing Plague `fa87f3d6-6e3b-4bc0-929b-6e62daf16178` ·
Pompeii `59646504-85d6-41cc-a2da-2cd4458f105e` · Congress `f319d5c6-acf8-4206-8fe2-3b6095d537a5`
