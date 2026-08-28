#!/bin/bash
# Prepend a thumbnail to a video as its opening frames.
#
#   bash bake_cover.sh <video.mp4> <thumb.jpg> <out.mp4> [hold_seconds]
#
# Why: TikTok's publish API has NO cover parameter for video — it takes frame 1
# whatever that happens to be. Baking the thumbnail into the file itself fixes
# the cover on every platform at once, and survives re-uploads.
#
# The hold is ~4 frames (0.13s at 30fps): long enough that TikTok picks it as
# the poster, short enough that playback blows past it before anyone reads it
# as a title card. Same trick as the Remotion CoverFrame.
set -euo pipefail

VIDEO="$1"; THUMB="$2"; OUT="$3"; HOLD="${4:-0.13}"

# Match the source exactly so the concat doesn't force a resample or rescale.
# ffprobe's csv writer appends a stray trailing comma on some muxers, and on
# Windows adds a CR — both corrupt the filter string if passed through raw.
probe () {
  ffprobe -v error -select_streams "$1" -show_entries "stream=$2" -of csv=p=0 "$VIDEO" \
    | head -1 | tr -d '\r,' | tr -d '[:space:]'
}
FPS=$(probe v:0 r_frame_rate | awk -F/ '{print ($2?$1/$2:$1)}')
W=$(probe v:0 width)
H=$(probe v:0 height)
SR=$(probe a:0 sample_rate)

echo "source: ${W}x${H} @ ${FPS}fps, audio ${SR}Hz — holding cover ${HOLD}s"

# The cover is scaled to FIT inside the frame and padded, never cropped: the
# thumbnails are 1080x1920 (9:16) and the videos 720x1280 (9:16), so this is a
# clean downscale, but the pad guards against any thumbnail that isn't 9:16.
ffmpeg -y -v error \
  -loop 1 -t "$HOLD" -i "$THUMB" \
  -f lavfi -t "$HOLD" -i "anullsrc=channel_layout=stereo:sample_rate=${SR}" \
  -i "$VIDEO" \
  -filter_complex "\
    [0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,\
pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=${FPS},format=yuv420p[cv];\
    [2:v]scale=${W}:${H},setsar=1,fps=${FPS},format=yuv420p[mv];\
    [cv][1:a][mv][2:a]concat=n=2:v=1:a=1[outv][outa]" \
  -map "[outv]" -map "[outa]" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -ar "$SR" \
  -movflags +faststart \
  "$OUT"

echo "wrote $OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT" | awk '{printf "duration: %.2fs\n", $1}'

# Every published video is baked here, so this is the one place worth hooking:
# copy the finished file into the Google Drive synced folder. Non-fatal by
# design — an unmounted Drive must never fail a render.
SYNC="$(dirname "$0")/../drive_sync.sh"
if [ -f "$SYNC" ]; then
  bash "$SYNC" "$OUT" || echo "  (drive sync skipped)"
fi
