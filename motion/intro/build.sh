#!/usr/bin/env bash
# Builds the 60 fps welcome film end to end. Run from motion/intro (Git Bash on Windows).
#   1. 60 fps loops    tiles and seal, re-rendered at 60 fps (skipped when already there)
#   2. Act 2           Remotion renders the app act for each theme (../remotion-intro)
#   3. Master          HyperFrames renders Act 1 + Act 2 + the finale at 60 fps for each theme
#   4. App copies      compressed into ../../assets/intro/ with an end-frame still each
set -e
HERE=$(pwd)
REMOTION=../remotion-intro

# 1 · Loops the film embeds (60 fps masters; the app's own tiles keep their 30 fps set).
[ -f ../tiles/renders60/leave-dark.mp4 ] || (cd ../tiles && ./render-60.sh)
[ -f ../seal/renders/seal60.mp4 ] || (cd ../seal && npx hyperframes render --fps 60 --quality delivery --output renders/seal60.mp4)
mkdir -p "$REMOTION/public/loops"
cp ../tiles/renders60/*.mp4 "$REMOTION/public/loops/"
cp ../seal/renders/seal60.mp4 "$REMOTION/public/loops/seal.mp4"
cp ../seal/renders/seal60.mp4 assets/seal60.mp4
ffmpeg -loglevel error -y -i ../seal/renders/seal60.mp4 -frames:v 1 -q:v 2 "$REMOTION/public/loops/seal-poster.jpg"

mkdir -p renders ../../assets/intro
for theme in light dark; do
  # 2 · Act 2 (Remotion). Near-lossless intermediate; the final encode happens once, in step 4.
  (cd "$REMOTION" && npx remotion render src/index.ts AppAct "out/act2-$theme.mp4" \
    --props="{\"theme\":\"$theme\"}" --codec=h264 --crf=10 --jpeg-quality=95)
  cp "$REMOTION/out/act2-$theme.mp4" "assets/act2-$theme.mp4"

  # 3 · Master (HyperFrames) at 60 fps.
  npx hyperframes render --fps 60 --quality delivery --strict-variables \
    --variables "{\"theme\":\"$theme\",\"act2\":\"assets/act2-$theme.mp4\"}" \
    --output "renders/intro-$theme.mp4"

  # 4 · App copy and the still shown with Reduce Motion.
  ffmpeg -loglevel error -y -i "renders/intro-$theme.mp4" -c:v libx264 -preset veryslow -crf 25 \
    -profile:v high -level 5.1 -pix_fmt yuv420p -r 60 -x264-params aq-mode=3 -movflags +faststart -an \
    "../../assets/intro/intro-$theme.mp4"
  ffmpeg -loglevel error -y -sseof -0.05 -i "renders/intro-$theme.mp4" -frames:v 1 -q:v 3 \
    "../../assets/intro/intro-$theme-end.jpg"
  echo "intro-$theme: $(du -k "../../assets/intro/intro-$theme.mp4" | cut -f1) KB"
done
cd "$HERE"
