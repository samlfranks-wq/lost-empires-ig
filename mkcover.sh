#!/bin/bash
# mkcover.sh <src.jpg> <out.jpg> "LINE1" ["LINE2"] ["LINE3"]
# White house-style hook on a 1080x1920 cover, placed inside TikTok's 1:1
# centre-crop window (y 420-1500) so the profile grid never cuts the headline.
# Font size auto-shrinks so the longest line always fits the 1080px width.
set -euo pipefail
SRC="$1"; OUT="$2"; shift 2
F="C\:/Windows/Fonts/ariblk.ttf"
MAX=0
for L in "$@"; do [ ${#L} -gt $MAX ] && MAX=${#L}; done
# Arial Black averages ~0.72em per glyph; 1020px keeps a safe side margin.
FS=$(awk -v m="$MAX" 'BEGIN{f=int(1020/(m*0.72)); if(f>74)f=74; print f}')
GAP=$(awk -v f="$FS" 'BEGIN{print int(f*1.28)}')
D="[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
Y=470; for L in "$@"; do
  D="$D,drawtext=fontfile='$F':text='$L':x=(w-text_w)/2:y=$Y:fontsize=$FS:fontcolor=white:borderw=7:bordercolor=black@0.9"
  Y=$((Y+GAP))
done
ffmpeg -y -v error -i "$SRC" -vf "$D" -q:v 2 "$OUT"
echo "wrote $OUT (fontsize $FS, longest line $MAX chars)"
