---
workflow: general-video
flow: automation
storyboard: no
message: "The school's emblem as a living pearl seal on the student card"
destination: in-app seal on the student ID card (muted autoplay loop, clipped to a circle)
aspect: 512x512
language: none
length: 6s
angle: premium logo loop, official colours untouched
---

## Intent

The Rajadamri School emblem (`assets/logo.png`, supplied by the user) as a small animated medallion on
the student card, front and back. The artwork is never redrawn or recoloured: `tools/split-logo.py`
splits it into rays, wheel and blue core, and asserts the layers recombine to the original pixels.

The seal is an opaque round disc, so the clip needs no transparency and reads the same on the light and
the dark card. The official blue would nearly vanish on the dark card without it (about 2:1 contrast).

## Motion (all whole cycles per 6 s, so the loop is seamless)

- Emblem floats and tilts a few degrees in 3D; the rays sit deepest, the blue crown in front, so they
  slide against each other (parallax).
- The nine rays brighten and lengthen outward from the finial, twice per loop.
- A soft sheen crosses the emblem (masked to its exact shape) and a highlight runs round the wheel.
- Six sparkles twinkle on the gold, in turn.
- A golden sunburst turns behind it (exactly one spoke per loop); the prism rim turns once.

## Notes

- Keep the emblem's own colours: yellow #F5E40B, blue #3B56A6.
- Build: `./build-asset.sh` renders, compresses to `../../assets/seal/seal.mp4`, and cuts the first frame
  as the poster (`seal.jpg`).
