#!/usr/bin/env bash
# Renders the seal loop and compresses it into the app bundle (../../assets/seal) with a
# first-frame poster, so the poster -> video handoff is invisible. Run from motion/seal.
set -e
mkdir -p renders ../../assets/seal
npx hyperframes render --quality delivery --output renders/seal.mp4 2>&1 | grep -E "(MB|KB) ·|Error|error" || true
# Fine linework and gold gradients: keep quality high; the file is small anyway.
ffmpeg -loglevel error -y -i renders/seal.mp4 -c:v libx264 -preset veryslow -crf 21 -profile:v high -pix_fmt yuv420p \
  -x264-params aq-mode=3:deblock=-1,-1 -movflags +faststart -an ../../assets/seal/seal.mp4
ffmpeg -loglevel error -y -i ../../assets/seal/seal.mp4 -frames:v 1 -q:v 2 ../../assets/seal/seal.jpg
echo "seal.mp4 $(du -k ../../assets/seal/seal.mp4 | cut -f1) KB, seal.jpg $(du -k ../../assets/seal/seal.jpg | cut -f1) KB"
