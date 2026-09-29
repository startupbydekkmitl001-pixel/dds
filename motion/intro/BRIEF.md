---
workflow: general-video
flow: automation
storyboard: no
message: "ทุกเรื่องในโรงเรียน ในแอปเดียว — every school errand, in one app"
destination: in-app welcome intro (Dschool Expo app, full-screen after first unlock)
aspect: 1080x2340
language: th
audience: Thai secondary-school students (and the school staff watching the pitch)
length: 14s
angle: feature showcase that assembles the app's own Home screen
---

## Intent

A welcome intro for the Dschool student-app pitch prototype. It plays once, full
screen, right after the first PIN unlock, and can be replayed from Settings →
แนะนำแอป. It should feel like the app itself coming alive: the frosted-pastel glass
look, ambient light orbs, calm premium motion — not a generic promo. The user asked
for "the best as you can".

## Assets

- assets/fonts/*.ttf — the app's own typefaces (Trirong 300 / 300 italic, IBM Plex Sans
  Thai 400/500, IBM Plex Mono 400/500), copied from `node_modules/@expo-google-fonts`
  (SIL OFL 1.1).

## Customizations

- Two renders from one composition via the `theme` variable: `light` and `dark`, so
  the intro matches the app's appearance setting.
- Silent (no audio track) — it autoplays inside the app.
- Last ~1.2s is a clean, still hold: the app overlays its own "เริ่มต้นใช้งาน" CTA
  and "ข้าม" pill on top of the final frame, so keep the bottom 380px and the
  top-right corner free of content.

## Notes

- All sample data is fictional and matches the app's seed: ภูมิ, ม.5/3,
  โรงเรียนตัวอย่างวิทยา. No real student data.
- Critical content stays inside the central 1080×1920 band (y 210–2130) so
  `contentFit="cover"` on shorter phones never crops it.
- Colors, radii and motion curves come from the app's `src/theme/tokens.ts` and
  `src/theme/motion.ts` — see `frame.md`.
