---
workflow: general-video
flow: automation
storyboard: no
message: "โรงเรียนราชดำริ, in one app"
destination: in-app welcome intro (Dschool Expo app, full screen after first unlock, muted)
aspect: 1080x2340
fps: 60
language: th
audience: Thai secondary-school students (and the school staff watching the pitch)
length: 18.5s
angle: from the school's emblem into the app
---

## Intent

The second welcome film, replacing the 30 fps original (still in git history at 4e31777). The user asked
for "the best and smooth as butter", at 60 fps, built with both Remotion and HyperFrames. Silent; it
autoplays inside the app, which lays its own ข้าม / เริ่มต้นใช้งาน controls over it.

## Structure (two tools, opaque hand-offs)

HyperFrames is the master timeline (`index.html`). Remotion (`../remotion-intro`) renders the app act as an
opaque 60 fps clip; transparent WebM is unreliable in Chromium, so nothing is layered with alpha.

| Time | Act | Tool |
| --- | --- | --- |
| 0 – 4.5 s | The emblem: a point of light, the nine real rays fan out, the crown draws down, the wheel turns in, the pearl seal forms, the name; then a push through the seal to the canvas | HyperFrames (+ a WebGL light-ray shader) |
| 4.4 – 18.5 s | The app: the student card springs in, flips to its QR and back, lifts away; the four Home tiles tumble in with their live 60 fps loops; a spotlight tour, one tile and one headline at a time | Remotion |
| 14.5 – 18.5 s | Finale over the grid: ทุกเรื่องในโรงเรียน / ในแอปเดียว, the seal and Dschool wordmark dock top-left; still from ~16.3 s | HyperFrames |

## Assets

- `assets/emblem/` — the school emblem split into rays, wheel and blue core (from `../seal/tools/split-logo.py`,
  pixel-exact).
- `assets/fonts/` — the app's typefaces (SIL OFL 1.1).
- 60 fps loops of the tiles and seal, from `../tiles/render-60.sh` and `../seal`.

## Notes

- The seam into Act 2 is the flat theme canvas plus the same grain tile, on both sides.
- Keep the bottom ~380 px of the final frame clear for the app's CTA, and the top-right for its ข้าม pill.
- Build everything with `./build.sh`.
