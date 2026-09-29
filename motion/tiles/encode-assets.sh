#!/usr/bin/env bash
# Compresses the render masters into the app bundle (../../assets/tiles) and cuts a poster from
# each loop's first frame, so the poster -> video handoff is invisible. Run from motion/tiles.
set -e
OUT=../../assets/tiles
mkdir -p "$OUT"
for f in renders/*.mp4; do
  name=$(basename "$f" .mp4)
  ffmpeg -loglevel error -y -i "$f" -c:v libx264 -preset veryslow -crf 26 -profile:v high -pix_fmt yuv420p \
    -x264-params aq-mode=3:deblock=-1,-1 -movflags +faststart -an "$OUT/$name.mp4"
  ffmpeg -loglevel error -y -i "$OUT/$name.mp4" -frames:v 1 -q:v 3 "$OUT/$name.jpg"
  echo "$name  $(du -k "$OUT/$name.mp4" | cut -f1) KB video, $(du -k "$OUT/$name.jpg" | cut -f1) KB poster"
done
