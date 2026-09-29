# Dschool iOS Redesign — Design Spec

- **Date:** 2026-09-29
- **Status:** Draft for review
- **Audience:** a pitch to the school / Dschool team

---

## 1. Goal

Build a working iOS prototype of a redesigned Dschool **student** app that the school or the Dschool team can hold in their hands. It keeps every function of the current app, fixes its UX problems, fills in the missing flows, and applies one design and motion language combined from four reference DESIGN.md files (Origin, Air, Superhuman, Vivid+Co).

### Success criteria

1. It runs on a real iPhone through **Expo Go** without a Mac.
2. Every function visible in the current app exists, plus the additions in §3. Every data screen has loading, empty and error states.
3. A first-time student can, without instructions: log in, see today's status, top up, pay by QR, and request leave.
4. Light and dark mode both work, iOS Reduce Motion is respected, and Thai text never clips its vowel or tone marks.
5. Logic tests pass, `tsc --noEmit` is clean, and every screen has been visually checked at 390×844 in both themes.

## 2. Constraints and assumptions

- **Platform:** Expo (React Native, TypeScript) with Expo Router. The dev machine runs Windows with no Xcode, so all native modules must work inside stock Expo Go. The web preview (`expo start --web`) is used for visual verification only.
- **Scope:** student role only. Thai-only UI.
- **Data:** sample data only, with no real backend. The fake API adds realistic latency.
- **Privacy:** none of the real name, photo, device ID or bank account from the reference screenshots is used. Placeholders:
  - Student: **ภูมิภัทร ศรีสุข** (nickname **ภูมิ**), ม.5/3, student ID `24815`
  - Advisor: ครูวรรณา ใจดี
  - School: **โรงเรียนตัวอย่างวิทยา**
  - Top-up account: ธนาคารตัวอย่าง, account `123-4-56789-0`, name โรงเรียนตัวอย่างวิทยา
  - Student photo: a generated monogram avatar (no real photo)
- **Assessments:** the SDQ/EQ questions are original generic sample items. The school plugs in its licensed instruments later.
- **Demo PIN:** `123456`, defined in the seed data file and noted in the README.
- **Dates:** Buddhist era (today = 29 ก.ย. 2569). Academic year 2569: semester 1 runs 16 May – 10 Oct, semester 2 runs 1 Nov – 31 Mar.

## 3. Information architecture

### Tabs (custom tab bar, frosted blur, raised center button)

| Tab | Route | Contents |
|---|---|---|
| หน้าหลัก | `(tabs)/index` | Greeting, Today card, balance card, 2×2 feature tiles, week strip, announcements |
| เวลาเรียน | `(tabs)/attendance` | Semester switch, attendance ring and status rows, month calendar, leave requests list and CTA |
| QR (raised) | opens `qr` sheet | Pay QR / Scan segmented sheet |
| กระเป๋า | `(tabs)/wallet` | Balance card, actions (top up, pay, freeze), combined history with daily chart, slip check |
| ฉัน | `(tabs)/me` | Student card (flip), behavior, assessments, profile, settings |

### Stacks and sheets

| Route | Presentation | Purpose |
|---|---|---|
| `(auth)/pin` | full screen | PIN / Face ID login |
| `(auth)/forgot-pin` | sheet | PIN reset steps + device ID |
| `notifications` | push | Alerts inbox |
| `qr` | full-screen modal | Pay QR + scanner |
| `topup` | modal (one route with internal animated steps) | 3-step top-up |
| `wallet-history` | push | Full transaction history with filters |
| `slip-check` | push | Slip check list (legacy "ตรวจสอบการเติมเงิน") |
| `leave/new` | modal | Leave request form |
| `leave/[id]` | push | Leave status timeline |
| `day/[date]` | sheet | Day detail |
| `behavior` | push | Score gauge, history, tips |
| `assessments/index` | push | SDQ / EQ list with status |
| `assessments/[id]` | modal | One-question-per-screen flow + result |
| `profile` | push | Student info, guardian, advisor |
| `settings/index` | push | Theme, PIN, Face ID, notifications, demo controls, logout |
| `settings/change-pin` | push | Current → new → confirm PIN |
| `announcement/[id]` | sheet | Announcement detail |
| `dev/kit` | push (demo section only) | Component gallery for visual QA |

### Coverage of current-app functions

| Current app | New home |
|---|---|
| PIN login, forgot PIN, device ID | `(auth)/pin`, `(auth)/forgot-pin` |
| นักเรียน 360 profile (ID, phones, guardian, advisor) | `profile` |
| บัตรนักเรียนดิจิทัล | Student card on `me` |
| รายงานขาด ลา มาสาย + semester picker | `attendance` tab |
| ลงเวลาโรงเรียน / ประวัติการส่งใบลา | `attendance` tab leave section, `leave/*` |
| รายงานพฤติกรรม (score 100) | `behavior` |
| ศูนย์อาหาร: ล่าสุด, ประวัติเติมเงิน, ประวัติใช้จ่าย | `wallet` tab + `wallet-history` |
| เติมเงิน (transfer + upload slip) | `topup/*` |
| ตรวจสอบการเติมเงิน | `slip-check` |
| อายัดบัตร | Freeze action on `wallet` |
| QR Code จ่ายเงิน, header QR scanner | `qr` |
| ประชาสัมพันธ์ | Home announcements + `notifications` |
| ประเมิน SDQ / EQ | `assessments/*` |
| แจ้งเตือน tab | `notifications` (bell on Home) |
| ตั้งค่า tab | `settings` (from Me) |

## 4. Design system

Direction **A · Daylight editorial**: Superhuman's parchment canvas and restraint, Origin's color-coded feature tiles and three-voice typography, Vivid+Co's motion curve and prism, and Air's frosted chrome.

### 4.1 Color

**Light (default)**

| Token | Value | Use |
|---|---|---|
| `canvas` | `#f2f0eb` | Page background |
| `card` | `#ffffff` | Cards, sheets |
| `hairline` | `#e3e3e2` | Borders, dividers |
| `text` | `#292827` | Primary text |
| `textSecondary` | `#666666` | Supporting text |
| `primary` | `#421d24` | The one primary button per screen; `onPrimary` `#ffffff` |
| `secondary` | `#d4c7ff` | Secondary button fill; text `#292827` |
| `link` | `#714cb6` | Inline links only |
| `pressed` | `#e9e6df` | Pressed rows on canvas |

**Dark**

| Token | Value |
|---|---|
| `canvas` | `#0f1011` |
| `card` | `#1c1c1d` |
| `cardRaised` | `#2e2e2e` |
| `hairline` | `#2e2e2e` |
| `text` | `#f5f5f7` |
| `textSecondary` | `#9f9fa0` |
| `primary` | `#ffffff` (`onPrimary` `#000000`) |
| `secondary` | `#3f4041` (text `#f5f5f7`) |
| `link` | `#b9a8ff` |
| `pressed` | `#3f4041` |

**Feature colors** (the same in both themes; tile text uses the paired ink)

| Feature | Fill | Ink on fill |
|---|---|---|
| Attendance | `#847dff` Iris | `#16123f` (white is only 3.3:1 on Iris, below the 4.5:1 minimum) |
| Wallet | `#dd90d8` Orchid | `#3a1238` |
| Behavior | `#90b8f0` Periwinkle | `#0c2a52` |
| Leave | `#d1c9ff` Pale Iris | `#2a2270` |
| Assessments | `#4b49aa` Deep Iris | `#ffffff` |
| Announcements | `#0c4243` Lagoon (band only) | `#ffffff` |

**Status colors** (data only: dots, bars, ring segments, badges; never buttons)

| Status | Thai | Color |
|---|---|---|
| present | มา | `#2f9e6a` |
| late | สาย | `#d99a1e` |
| noScan | ไม่ลงเวลา | `#8a7a66` |
| sick | ลาป่วย | `#3b6fd8` |
| personal | ลากิจ | `#3aa3e0` |
| absent | ขาด | `#e0473e` |

The success, warning and danger roles reuse present, late and absent.

### 4.2 Typography

| Role | Font | Weight | Size / line height | Notes |
|---|---|---|---|---|
| display | Trirong | 300 (+300 italic) | 40 / 50 | Greetings, hero; one italic word |
| title | Trirong | 300 | 30 / 38 | Screen titles |
| heading | IBM Plex Sans Thai | 500 | 20 / 28 | Section/card headings |
| body | IBM Plex Sans Thai | 400 | 16 / 24 | Default text |
| label | IBM Plex Sans Thai | 500 | 14 / 20 | Buttons, rows |
| caption | IBM Plex Sans Thai | 400 | 13 / 18 | Metadata |
| data | IBM Plex Mono | 500 | 12–44 | Money, times, dates, counts (digits and Latin only) |
| eyebrow | IBM Plex Mono | 500 | 11 / 16, letter-spacing 1.5, uppercase | Latin/digit micro-labels only |

- Thai line height is at least 1.2× everywhere. The reference files' 0.9 leading is deliberately not used because it clips Thai marks.
- Text respects Dynamic Type (`allowFontScaling`), capped at 1.4× on display and title sizes.

### 4.3 Space, shape and depth

- Spacing uses a 4-point base: 4, 8, 12, 16, 20, 24, 32, 40, 48. Screen side padding is 20.
- Radii: tile 28, card 16, button 16, input 12, chip 999, sheet top 28.
- Buttons are 52pt tall (primary and secondary). The minimum hit target is 44pt.
- No drop shadows. Depth comes from surface steps. The header and tab bar use a frosted blur (expo-blur, intensity 40) once content scrolls under them.

### 4.4 Motion

| Token | Value | Use |
|---|---|---|
| `fast` | 200ms, `Easing.ease` | Press, color, toggles |
| `base` | 450ms, `bezier(0.52, 0.01, 0, 1)` | Screen enter, sheets, card flip, number reveal |
| `slow` | 1400ms, `bezier(0.455, 0.03, 0.515, 0.955)` | Hero reveals (PIN wordmark, first Home load) |
| `shimmer` | 6650ms linear loop | Prism shimmer |
| `spring` | damping 20, stiffness 180, overshoot clamped | Gesture follow-through (no bounce) |
| `stagger` | 40ms per item, max 8 items | List/tile entrance |
| `pressScale` | 0.97 | Pressables |

**Motion primitives:**
- `PressableScale`
- `StaggerIn`: fade + 12pt rise
- `NumberTicker`: count-up over `base`
- `Shake`: 4 cycles, 8pt, 320ms
- `BorderTrace`: an SVG stroke-dashoffset trace around a rounded rect, as a one-shot or a countdown
- `PrismShimmer`: a diagonal gradient band, `#ff2a2a`/`#2a7fff`/`#2aff2a` at 18% opacity with a screen-like blend, translating on loop and offset by device tilt through expo-sensors on native only
- `Skeleton`: shimmer placeholder

**Reduce Motion:** when on, every primitive falls back to a 200ms opacity fade, and the shimmer and tilt are disabled.

**Haptics:**

| Event | Haptic |
|---|---|
| PIN digit, tab change | `selectionAsync` |
| Success | `notificationAsync(Success)` |
| Error | `notificationAsync(Error)` |
| Toggle, flip | `impactAsync(Light)` |

Haptics are no-ops on web.

### 4.5 Iconography

Lucide line icons at 1.75 stroke, sized 20–24.

## 5. Screens and flows

Every screen that loads data shows a skeleton while loading, a `ErrorState` with a retry button on failure, and an `EmptyState` when there is nothing to show. `EmptyState` has three parts: an icon in the feature's color, one line of text, and a CTA.

### 5.1 PIN login

- The Dschool wordmark (Trirong 300) and "ยินดีต้อนรับกลับ *ภูมิ*" fade in with `slow`.
- 6 dots, then a custom 3×4 keypad with digits, Face ID at bottom-left and delete at bottom-right. Keys are 72pt.
- Each digit fills its dot with a scale-pop and a selection haptic.
- **Wrong PIN:** the dots `Shake`, flash red, and the caption shows "PIN ไม่ถูกต้อง · เหลืออีก N ครั้ง". Five wrong attempts lock input for 30 seconds with a visible countdown.
- **Correct PIN:** a `BorderTrace` runs around the dot row, the dots morph into a check, and the app routes to Home with the `base` transition.
- **Face ID:** offered automatically on appear if it's enabled and available (expo-local-authentication). On web or an unsupported device, the button is hidden.
- "ลืม PIN?" opens the `forgot-pin` sheet: three numbered steps to contact the advisor or the registrar, the advisor's contact, and the device ID in mono with a copy button.

### 5.2 Home

- **Header:** mono date "อ. 29 ก.ย. 2569", Trirong greeting "สวัสดีตอนเช้า / *ภูมิ*" (time-of-day aware), and a bell with an unread count badge.
- **Today card:** a status pill and time, e.g. "ถึงโรงเรียน 07:32 · ตรงเวลา" in green. Before arrival it reads "ยังไม่ลงเวลา · ประตูปิด 08:00", and on a leave day it reads "วันนี้ลาป่วย". On weekends, holidays or between semesters it reads "วันนี้ไม่มีเรียน". An approved leave covering today always wins over the demo arrival setting.
- **Balance card:** PrismShimmer, a mono `NumberTicker` balance, "ใช้ไปวันนี้ ฿45", and two buttons: เติมเงิน (primary) and จ่าย QR (secondary).
- **2×2 feature tiles:** Attendance (streak "ตรงเวลา 12 วัน"), Behavior (score 100), Leave (pending count or "ยื่นใบลา"), and Assessments (count due). Tiles use `StaggerIn`.
- **Week strip:** Mon–Fri status dots.
- **Announcements:** the latest 3, shown on a Lagoon band card, plus a "ดูทั้งหมด" link to `notifications`.
- Pull-to-refresh refetches everything.

### 5.3 Wallet and top-up

**Wallet tab**
- Balance card: the same component as Home, in a larger variant.
- Action row: เติมเงิน, จ่าย QR, อายัดบัตร, ตรวจสอบสลิป.
- A 7-day spending bar chart (react-native-svg, Orchid bars, today highlighted).
- Combined history grouped by day. Top-ups show `+฿50` in green with a Slip badge, and purchases show `−฿35` with the shop name. "ดูทั้งหมด" opens `wallet-history`, which has All / Top-ups / Spending filters.

**Freeze card**
- A confirmation sheet explains the effect before freezing.
- While frozen: a banner shows on Wallet and Home, the pay QR shows a locked state, and an "ยกเลิกอายัด" (unfreeze) action appears.

**Top-up** (modal stack, `ProgressSteps` header ①②③)
1. **Amount:** chips for 20, 50, 100 and 200, plus a custom field (min 10, max 2,000). The primary button reads "ถัดไป · ฿50".
2. **Transfer:** the account card (bank, mono account number, name) with a copy button and the toast "คัดลอกเลขบัญชีแล้ว".
   - Notes: TrueMoney and ShopeePay aren't supported yet, and students shouldn't transfer through PromptPay using the account number.
   - Button: "โอนแล้ว · อัปโหลดสลิป".
3. **Slip:** pick an image (expo-image-picker; web uses a file input), or tap the subtle "ใช้สลิปตัวอย่าง (เดโม)" link, which uses a drawn sample slip (`demo://slip`) so the pitch never depends on having a real slip photo. A scan line sweeps the slip thumbnail for 2.4s, then one of:
   - **Verified:** a check with `BorderTrace`, "เติมเงินสำเร็จ", the new balance counting up, a Success haptic, and the button "กลับไปที่กระเป๋า".
   - **Pending:** "กำลังตรวจสอบสลิป เราจะแจ้งเตือนเมื่อเสร็จ" with a "ปิด" button. A background timer verifies the slip after 20s, credits the balance and pushes an alert.
   - **Rejected** (demo toggle): "ตรวจสอบสลิปไม่ผ่าน" with a reason and a "ลองอีกครั้ง" button.

**Slip check** (`slip-check`): a list of recent bank-side transfers (date-time, amount), each with an "ตรวจสอบ" button. The button runs the same verify step and marks the item "เติมแล้ว".

### 5.4 QR pay and scan

- A full-screen modal with a segmented control: จ่ายเงิน / สแกน. Swipe down to dismiss.
- **Pay:**
  - The student's QR (react-native-qrcode-svg) inside a `BorderTrace` countdown ring (60s). It regenerates a random token at zero.
  - Balance shown underneath, and screen brightness raised to max while open, restored on close (expo-brightness, native only).
  - Frozen card: the QR is blurred and shows a locked message.
  - **Demo:** long-pressing the QR simulates a canteen scan. It deducts ฿35 at "ร้านข้าวมันไก่ป้าน้อย" with a success animation, a haptic and a history entry.
- **Scan:** expo-camera barcode scanning with a rounded viewfinder and a corner-trace animation. A scanned result opens a confirmation sheet showing the raw value (the school decides what QR payloads mean later). On web, it shows "ใช้กล้องได้บนมือถือ".

### 5.5 Attendance and leave

- A segmented control at the top of the page: ภาคเรียน 1 / ภาคเรียน 2. The current semester is the default.
- **Ring:** the present percentage in the center (mono `NumberTicker`), made of segments per status.
- **6 status rows:** colored dot, Thai label, mono count "42 วัน", and a thin proportional bar.
- **Streak chip:** "มาตรงเวลาติดต่อกัน 12 วัน".
- **Month calendar:** swipe or tap arrows to change month (limited to the semester's months). Days show status dots, and weekends and holidays are muted. Tapping a day opens the `day/[date]` sheet: status, check-in time, gate, and any leave note.
- **Leave section:**
  - "ยื่นใบลา" primary button.
  - A list of requests with status badges: รออนุมัติ in amber, อนุมัติแล้ว in green, ไม่อนุมัติ in red.
  - Empty state: "ยังไม่มีใบลาในภาคเรียนนี้" with the "ยื่นใบลา" CTA.
- **`leave/new`:**
  - Type segmented control: ลาป่วย / ลากิจ.
  - Start and end dates (inline calendar range picker; weekends excluded from the count shown as "รวม 2 วันเรียน").
  - Reason (required, 5–300 characters) and an optional photo.
  - Inline validation messages. Submitting shows a success check, then routes to `leave/[id]`.
- **`leave/[id]`:**
  - A vertical timeline: ส่งแล้ว → ครูที่ปรึกษาอนุมัติ → บันทึกในระบบ. Each step shows a time when done and animates when it advances.
  - Background simulation: approval after 30s (5s with "เร่งการอนุมัติ" on), recorded 10s later (3s when sped up), with an alert at each step. Due times are stored, so progress resumes after an app restart.
  - An approved leave marks those dates sick/personal in the calendar.

### 5.6 Me

- **Student card:** 3:2 ratio with PrismShimmer.
  - Front: monogram avatar, name, class, student ID in mono, and the school name.
  - Tap to flip (3D rotateY over `base`, Light haptic). The back shows a barcode-style QR of the student ID and the validity period "ปีการศึกษา 2569".
- **Rows:**
  - พฤติกรรม (score)
  - แบบประเมิน (due count)
  - ข้อมูลส่วนตัว
  - ตั้งค่า

### 5.7 Behavior

- An arc gauge showing 100 out of 100 max, with a `NumberTicker`.
- History timeline: `+5 จิตอาสาทำความสะอาด` in green and `−5 แต่งกายผิดระเบียบ` in red, each with a date.
- A "วิธีได้รับคะแนน" (how to earn points) info card.
- Empty history state: "ยังไม่มีการหัก/เพิ่มคะแนน · รักษาไว้นะ".

### 5.8 Assessments

- **List:** EQ and SDQ cards showing status (ยังไม่ทำ / ทำแล้ว, with date) and the question count.
- **Flow:**
  - A progress bar and "ข้อ 3/10", then the question in heading style.
  - 3 or 4 large answer pills. Choosing one gives a haptic and auto-advances after 250ms.
  - Back is allowed.
- **Result:** a summary per dimension with bars, plus a disclaimer that it's a sample and that the school counselor reviews real results.

### 5.9 Alerts

- Sections วันนี้ and ก่อนหน้า. Each alert shows a feature-colored icon chip, a title, a snippet and a relative time.
- Unread alerts have a dot. Swiping left marks an alert read, and "อ่านทั้งหมด" marks all read.
- Tapping an alert deep-links to its screen: top-up alerts go to Wallet, leave alerts to `leave/[id]`, announcements to a detail sheet.

### 5.10 Profile and settings

- **Profile:** student ID, class, phone, guardian name and phone, and advisor, each with a copy or call affordance. Missing values show "ยังไม่มีข้อมูล · ติดต่อฝ่ายทะเบียน" instead of "-".
- **Settings:**
  - Theme: ตามระบบ / สว่าง / มืด.
  - เปลี่ยน PIN: current, then new, then confirm, using the same keypad.
  - Face ID toggle.
  - Notification toggles per category.
  - About.
  - ออกจากระบบ (log out), with a confirmation.
- **Demo controls** (revealed by tapping the version row 5 times):
  - Reset demo data
  - Simulate network errors
  - Slip result mode: auto / pending / reject
  - Speed up leave approval
  - Arrival state: arrived / not yet / on leave

## 6. Architecture

```
app/                     Expo Router routes (§3)
src/theme/               tokens.ts, typography.ts, motion.ts, ThemeProvider.tsx, useTheme.ts
src/components/ui/       Text, Button, Card, Tile, Chip, Segmented, Sheet, Skeleton,
                         EmptyState, ErrorState, Toast, ProgressSteps, ListRow, Header, TabBar
src/components/motion/   PressableScale, StaggerIn, NumberTicker, Shake, BorderTrace, PrismShimmer
src/features/<feature>/  feature components (auth, home, wallet, qr, attendance, leave, me,
                         behavior, assessments, notifications, settings)
src/lib/                 format.ts (baht, Thai dates, BE years), attendance.ts (stats),
                         pin.ts (attempt/lockout), topup.ts (state machine), leave.ts (status flow),
                         countdown.ts, platform.ts (native-only guards)
src/data/                seed.ts (fixtures incl. demo PIN), api.ts (fake async API),
                         store.ts (zustand + persist), simulations.ts (timers → store + alerts),
                         useResource.ts (loading/error/data/refetch)
```

**Libraries**
- expo-router, react-native-reanimated, react-native-gesture-handler
- expo-haptics, expo-local-authentication, expo-camera, expo-brightness, expo-image-picker
- expo-clipboard, expo-blur, expo-linear-gradient, expo-sensors, expo-secure-store, expo-font
- react-native-svg, react-native-qrcode-svg, lucide-react-native, zustand
- @react-native-async-storage/async-storage
- @expo-google-fonts/trirong, @expo-google-fonts/ibm-plex-sans-thai, @expo-google-fonts/ibm-plex-mono
- Install with `npx expo install` so versions match the Expo SDK.

**Data flow**
- Screens read through `useResource(api.x)`, which returns `{ data, loading, error, refetch }`.
- The fake API resolves from the store/seed after 350–900ms. It rejects when "simulate network errors" is on.
- Mutations (top-up, freeze, leave submit, mark read, settings, PIN change) are store actions. The store persists to AsyncStorage.
- `simulations.ts` schedules the timers for pending slip verification and leave progression, updates the store and appends alerts.
- The PIN is kept in expo-secure-store on native and in the persisted store on web.

**Platform guards:** Face ID, camera, brightness, haptics and tilt run only on native. Web shows sensible fallbacks, so the web preview never crashes.

**Error handling**
- API failures surface as `ErrorState` with a retry.
- Mutations that fail show a toast ("ทำรายการไม่สำเร็จ ลองอีกครั้ง") and leave state unchanged.
- Form validation is inline and field-level.
- A root error boundary shows a friendly reload screen.

## 7. Testing and verification

- **Unit tests** (jest-expo, written test-first), in `src/lib/*`:
  - baht and Thai date/BE formatting
  - attendance stat aggregation and streak
  - PIN attempts and lockout
  - top-up state machine and amount validation
  - leave date-range school-day counting and status progression
  - countdown
  - time-of-day greeting
- **Static:** `tsc --noEmit` in strict mode.
- **Visual:** `expo start --web`, then every route checked in the browser pane at 390×844, light and dark, with screenshots reviewed.
- **Device:** the user runs `npx expo start` (or `--tunnel`) and opens the app in Expo Go to check Face ID, camera, brightness, haptics and tilt.
- **Face ID caveat:** Expo Go may not show the real Face ID prompt on iOS (it can fall back to the device passcode). A development build (`eas build --profile development`) shows the true Face ID prompt. The README documents this.

## 8. Build order

1. **Foundation:** scaffold, fonts, theme and tokens, UI kit, motion primitives, data layer and store, tab shell, PIN login.
2. **Home and Wallet:** balance card, top-up flow, QR pay/scan, history, freeze, slip check.
3. **Attendance and leave:** ring, rows, calendar, day sheet, leave form, timeline and simulation.
4. **Me:** student card, behavior, assessments, alerts inbox, profile, settings and demo controls.
5. **Polish and verification pass:** states, dark mode, Reduce Motion, README with run instructions.

## 9. Out of scope

- A real Dschool API or backend integration.
- Parent and teacher roles.
- English localization.
- Real push notifications (alerts are in-app and simulated).
- App Store or TestFlight submission.
- Timetable and grades.
- Licensed SDQ/EQ content.
