#!/bin/bash
# Retitle a text-free thumbnail master into a platform-safe cover.
#
#   bash retitle.sh <notext.png> <out.jpg> "LINE 1" "LINE 2" ["LINE 3"]
#
# WHY THE TEXT SITS WHERE IT DOES
# TikTok's profile grid renders only the centre 1:1 square of a 1080x1920
# cover (top and bottom 420px are invisible), and TikTok overlays the caption's
# first line across the bottom ~270px in feed. So the headline is placed in the
# vertical middle, inside both safe areas at once, rather than at the bottom
# where our earlier covers put it and got cut off.
#
# A soft dark scrim sits behind the text so it stays readable over busy art -
# the same trick Historical Doodle use with their parchment banners.
set -euo pipefail

SRC="$1"; OUT="$2"; L1="${3:-}"; L2="${4:-}"; L3="${5:-}"
F="C\\:/Windows/Fonts/impact.ttf"

# Long, specific headlines need a smaller size than 3-word ones.
SIZE=74
LINE=92
# Centre the block on y=1150: comfortably inside the 420-1500 safe window.
if [ -n "$L3" ]; then Y1=1035; else Y1=1080; fi
Y2=$(( Y1 + LINE ))
Y3=$(( Y2 + LINE ))

# Scrim height follows the number of lines.
if [ -n "$L3" ]; then SCRIM_Y=$(( Y1 - 45 )); SCRIM_H=$(( LINE * 3 + 90 ));
else SCRIM_Y=$(( Y1 - 45 )); SCRIM_H=$(( LINE * 2 + 90 )); fi

FILTER="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
FILTER="$FILTER,drawbox=x=0:y=${SCRIM_Y}:w=1080:h=${SCRIM_H}:color=black@0.42:t=fill"
FILTER="$FILTER,drawtext=fontfile='$F':text='${L1}':fontcolor=white:fontsize=${SIZE}:borderw=9:bordercolor=black:x=(w-text_w)/2:y=${Y1}"
[ -n "$L2" ] && FILTER="$FILTER,drawtext=fontfile='$F':text='${L2}':fontcolor=white:fontsize=${SIZE}:borderw=9:bordercolor=black:x=(w-text_w)/2:y=${Y2}"
[ -n "$L3" ] && FILTER="$FILTER,drawtext=fontfile='$F':text='${L3}':fontcolor=white:fontsize=${SIZE}:borderw=9:bordercolor=black:x=(w-text_w)/2:y=${Y3}"

ffmpeg -y -v error -i "$SRC" -vf "$FILTER" -q:v 2 "$OUT"
echo "wrote $OUT"
