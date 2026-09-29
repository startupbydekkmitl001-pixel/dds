---
message: "ทุกเรื่องในโรงเรียน ในแอปเดียว — every school errand, in one app"
audience: Thai secondary-school students
mode: autonomous
duration: 14.5
structure: monolithic (one index.html, continuous shared background; scenes are phases, not hard cuts)
---

# Dschool welcome intro

Concept angle: four frosted glass cards each perform their feature at hero size,
then dock into a tray; in the finale the tray unfolds into the app's own Home bento
grid — the app assembles itself in front of the student.

Persistent layers (0–14.5s): canvas, four ambient orbs drifting on sine loops
(`ambient-glow-bloom`, `sine-wave-loop`), static grain, the docked wordmark anchor
(`fixed-anchor-cycle` anchor), and the four-chip tray that fills as scenes complete.

## Frame 1 — Welcome (0.0–2.4s)

- status: built · src: index.html · blueprint: `logo-assemble-lockup` · rules:
  `ambient-glow-bloom`, `waterfall-entry`, `spring-pop-entrance`
- Orbs bloom in; a prism halo turns behind "ยินดีต้อนรับสู่ / Dschool"; wordmark letters
  rise; the "สวัสดี ภูมิ · ม.5/3" glass pill springs in. The wordmark then docks to the
  top-left as the anchor while the empty tray rises.

## Frame 2 — Attendance (2.4–4.8s)

- status: built · src: index.html · blueprint: `dataviz-countup` · rules: `svg-path-draw`,
  `counting-dynamic-scale`, `spring-pop-entrance`
- "มาเรียนตรงเวลา". Ring segments draw (present / late / sick / personal), centre counts
  to 96%, the week strip's status dots pop. Card docks into chip 1.

## Frame 3 — Wallet (4.8–7.2s)

- status: built · src: index.html · blueprint: `dataviz-countup` · rules:
  `stat-bars-and-fills`, registry `number-wheel`, registry `shimmer-sweep`
- "กระเป๋าเงินในมือ". Balance rolls ฿0 → ฿1,250.00 on odometer wheels, "+฿500
  เติมเงินสำเร็จ" pops, seven spend bars grow. Card docks into chip 2.

## Frame 4 — QR pay (7.2–9.6s)

- status: built · src: index.html · blueprint: `agent-progress-theater` (single-trigger
  → receipt) · rules: `spring-pop-entrance`, `svg-path-draw`
- "จ่ายด้วย QR". Finder squares pop, data modules reveal radially, a scan line passes,
  the border trace closes in green and the "จ่ายแล้ว ฿35.00" receipt pops. Docks to chip 3.

## Frame 5 — Leave (9.6–12.0s)

- status: built · src: index.html · blueprint: `agent-progress-theater` (checklist
  checks off) · rules: `svg-path-draw`, `stat-bars-and-fills`, `spring-pop-entrance`
- "ส่งใบลาในไม่กี่แตะ". ส่งใบลาแล้ว → ครูที่ปรึกษาอนุมัติ → บันทึกในระบบแล้ว light in turn
  with drawn checks and filling connectors; "อนุมัติแล้ว" badge. Docks to chip 4.

## Frame 6 — Home assembles (12.0–14.5s)

- status: built · src: index.html · blueprint: `grid-card-assemble` (Key_Feature grid) →
  `titlecard-reveal` hold · rules: `card-morph-anchor`, `ambient-glow-bloom` (traveling sheen)
- The four chips unfold into the 2×2 bento tiles; "ทุกเรื่องในโรงเรียน / ในแอปเดียว"
  rises above; one sheen travels across the grid; still hold from 13.3s for the app's CTA.
