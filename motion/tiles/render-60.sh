#!/usr/bin/env bash
# 60 fps masters of every tile loop, for the welcome film (the app's tiles use the 30 fps set).
# Run from motion/tiles.
set -e
mkdir -p renders60
for scene in attendance behavior leave assessments; do
  for theme in light dark; do
    npx hyperframes render --fps 60 --quality delivery --strict-variables \
      --variables "{\"scene\":\"$scene\",\"theme\":\"$theme\"}" \
      --output "renders60/$scene-$theme.mp4" 2>&1 | grep -E "(MB|KB) ·|Error|error" || true
  done
done
echo "TILES DONE"
