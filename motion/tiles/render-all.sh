#!/usr/bin/env bash
# Renders every tile loop (4 tiles x light/dark) into renders/. Run from motion/tiles.
set -e
for scene in attendance behavior leave assessments; do
  for theme in light dark; do
    echo "== $scene / $theme"
    npx hyperframes render --quality delivery --strict-variables \
      --variables "{\"scene\":\"$scene\",\"theme\":\"$theme\"}" \
      --output "renders/$scene-$theme.mp4" 2>&1 | grep -E "(MB|KB) ·|Error|error" || true
  done
done
echo "ALL DONE"
