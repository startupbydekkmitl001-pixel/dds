---
name: Dschool — Frosted pastel (video)
source: src/theme/tokens.ts, src/theme/typography.ts, src/theme/motion.ts (Dschool Expo app)
canvas: { width: 1080, height: 2340, fps: 30 }
colors:
  light:
    canvas: "#eef0f7"
    text: "#1c1d2b"
    textSecondary: "#4f5369"
    primary: "#262840"
    link: "#4b40b5"
    accent: "#8b82e6"
    hairline: "#dfe1ec"
    glass: "rgba(255,255,255,0.58)"
    glassBorder: "rgba(255,255,255,0.85)"
    gloss: "rgba(255,255,255,0.75)"
    shadow: "rgba(72,66,140,0.10)"
    successText: "#16663f"
    ambient: ["#c9c2f2", "#bcd6f4", "#c4e8d8", "#f3d2da"]
    ambientOpacity: 0.5
  dark:
    canvas: "#0d0e18"
    text: "#f1f1f8"
    textSecondary: "#b1b4ca"
    primary: "#e9e7ff"
    link: "#b9b1ff"
    accent: "#9d95f0"
    hairline: "#2a2c40"
    glass: "rgba(255,255,255,0.075)"
    glassBorder: "rgba(255,255,255,0.13)"
    gloss: "rgba(255,255,255,0.10)"
    shadow: "rgba(0,0,0,0.42)"
    successText: "#80dab0"
    ambient: ["#3f3a78", "#1f4262", "#1d4a44", "#4d2c4c"]
    ambientOpacity: 0.55
  features:
    light:
      attendance: { fill: "#dcd7fb", ink: "#2e2870", glow: "#a99cf0" }
      wallet: { fill: "#f8dce5", ink: "#6a2442", glow: "#eea8c0" }
      qr: { fill: "#d4e5f8", ink: "#163e66", glow: "#9cc3ee" }
      leave: { fill: "#d5efe4", ink: "#1b5440", glow: "#9ed9c0" }
    dark:
      attendance: { fill: "#2b2850", ink: "#dcd7ff", glow: "#7b6fd0" }
      wallet: { fill: "#3b2536", ink: "#f9d3e0", glow: "#c27792" }
      qr: { fill: "#1f3149", ink: "#d0e4fb", glow: "#6d9bcf" }
      leave: { fill: "#1c3a31", ink: "#caefdf", glow: "#6fb597" }
  status: { present: "#4aa77c", late: "#d9a043", sick: "#6c8ee0", personal: "#5fb3d6" }
  prism: ["#f6c9dd", "#c6d6fb", "#c4eedd"]
  qr: { ink: "#000000", paper: "#ffffff" }
typography:
  display: { family: "Trirong", weight: 300, italic: true, lineHeight: 1.4 }
  ui: { family: "IBM Plex Sans Thai", weights: [400, 500], lineHeight: 1.35 }
  data: { family: "IBM Plex Mono", weights: [400, 500] }
radius: { card: 72, tile: 64, pill: 999 }
motion:
  base: "cubic-bezier(0.52, 0.01, 0, 1)"
  out: "cubic-bezier(0.16, 1, 0.3, 1)"
  slow: "cubic-bezier(0.455, 0.03, 0.515, 0.955)"
---

## Overview

The app's frosted-pastel identity at video scale: translucent glass over four slow
ambient light pools (lavender, sky, mint, rose), one deep ink for emphasis, soft
tinted shadows. Calm and premium, never neon.

## The Frame

- Portrait 1080×2340 (the iPhone 390×844 aspect). 1pt in the app ≈ 2.77px here.
- Keep every critical element inside y 210–2130 so `contentFit="cover"` on shorter
  phones never crops it. The app overlays a "ข้าม" pill at the top-right and the
  CTA across the bottom ~380px on the final frame.

## Composition Rules

- Trirong 300 is the emotional voice (headlines, wordmark). IBM Plex Sans Thai
  carries UI labels. IBM Plex Mono is for numbers, times and Latin labels only.
- Thai line height ≥ 1.35 so stacked vowel and tone marks never clip.
- Glass: translucent fill, 3px bright rim, top-edge gloss, large soft tinted shadow.
- Each feature keeps its pastel everywhere it appears (tile fill, icon disc, glow).
- QR codes stay black on white in both themes.

## Do / Don't

- Do reuse the app's own curves: `base` for meaningful moves, `out` for arrivals.
- Don't use gradient text, neon, or pure #000/#fff outside the QR paper.
- Don't let decoratives compete with the hero card.
