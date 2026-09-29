---
workflow: general-video
flow: automation
storyboard: no
message: "Every Home tile gets its own calm, glossy, seamlessly looping piece of art"
destination: in-app tile art (Dschool Expo app, Home bento tiles, muted autoplay loop)
aspect: 864x480
language: none
length: 6s
angle: four 3D-style loops after the Inspora reference, in each feature's pastel
---

## Intent

Four looping "renders" for the Home tiles (เวลาเรียน, พฤติกรรม, ใบลา, แบบประเมิน), in the spirit of the
Inspora "Pick your Plan" reference where each tile carries its own glossy loop. Original art, not the
reference footage. Each has a light and a dark version that follow the app's appearance.

| Tile | Loop |
| --- | --- |
| attendance | glass sphere rocking in lavender ripples |
| behavior | blue glass spheres and coins turning in front of bokeh |
| leave | mint silk in slow folds, sheen sliding along them |
| assessments | three twisting silk ribbons, one flare gliding along the front one |

## Notes

- Every time-varying term is a whole number of cycles per 6 s, so the loop is seamless by construction.
- One WebGL2 fragment shader per tile (`shaders/`), selected by the `scene` and `theme` variables.
  `main.js` compiles it; the timeline in `index.html` is the only clock.
- Composition is safe for `cover` cropping: the app shows about 84% of the width on a phone and a centre strip
  on wide screens. The top-left corner stays calm because the app puts an icon chip there.
- Silent, no audio track.
