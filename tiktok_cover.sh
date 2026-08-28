#!/bin/bash
# Build a TikTok-grid-safe cover from an existing 9:16 thumbnail.
#
#   bash tiktok_cover.sh <thumb.jpg> <out.jpg> [crop_top_y]
#
# WHY THIS EXISTS
# TikTok's profile grid renders a 1:1 CENTRE crop of the 1080x1920 cover: the
# top 420px and bottom 420px are invisible there. Our thumbnails put the
# headline at roughly y=1425-1725, i.e. below the visible window, so the hook
# text vanishes on the profile page — the one place a new viewer decides
# whether to tap.
#
# THE FIX
# Choose a 1080x1080 window from the source that contains BOTH the subject and
# the headline, and place that window dead centre of a fresh 1080x1920 canvas.
# Whatever TikTok crops to the centre square is then exactly our chosen window.
# The dead top/bottom bands are filled with a blurred, darkened copy of the
# source so the full-screen cover still looks deliberate rather than letterboxed.
#
# crop_top_y defaults to 720, which captures the lower artwork plus the headline
# on our current thumbnail layout. Raise it to favour the headline, lower it to
# favour the artwork.
set -euo pipefail

SRC="$1"; OUT="$2"; TOP="${3:-720}"

W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width  -of csv=p=0 "$SRC")
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$SRC")

# Work in 1080x1920 space regardless of what the source happens to be.
CANVAS_W=1080; CANVAS_H=1920; SQUARE=1080

# Clamp the crop window so it can never run past the bottom of the source.
MAXTOP=$(( H - SQUARE ))
if [ "$MAXTOP" -lt 0 ]; then MAXTOP=0; fi
if [ "$TOP" -gt "$MAXTOP" ]; then TOP="$MAXTOP"; fi

echo "source ${W}x${H} -> centre square from y=${TOP}"

ffmpeg -y -v error -i "$SRC" -filter_complex "\
  [0:v]scale=${CANVAS_W}:${CANVAS_H}:force_original_aspect_ratio=increase,\
crop=${CANVAS_W}:${CANVAS_H},boxblur=40:2,eq=brightness=-0.15[bg];\
  [0:v]scale=${CANVAS_W}:-1,crop=${SQUARE}:${SQUARE}:0:${TOP}[fg];\
  [bg][fg]overlay=(W-w)/2:(H-h)/2[out]" \
  -map "[out]" -q:v 2 "$OUT"

echo "wrote $OUT"
