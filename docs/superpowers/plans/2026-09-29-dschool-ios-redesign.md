# Dschool iOS Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Expo (React Native) iOS prototype of the redesigned Dschool student app: every current function plus the new flows, the combined "Daylight editorial" design system, and motion, all running on sample data.

**Architecture:**
- Expo Router screens read live data from one persisted zustand store (seeded deterministically from "now"). A `useResource` hook gates each screen's first load, so skeletons and error states show realistically.
- Pure domain logic lives in `src/lib` and is unit-tested first.
- UI is composed from a small token-driven kit (`src/components/ui`) and motion primitives (`src/components/motion`).
- Simulated backend events (pending top-ups, leave approvals) are stored as due times and settled by a 1-second `tick`.

**Tech stack:**
- Expo SDK 57 (React Native 0.86, React 19.2), Expo Router, TypeScript strict
- Reanimated 4 + react-native-worklets, Gesture Handler
- zustand 5 (persist + AsyncStorage), react-native-svg, react-native-qrcode-svg, lucide-react-native
- Expo modules: haptics, local-authentication, camera, brightness, image-picker, clipboard, blur, linear-gradient, sensors, secure-store
- Google Fonts: Trirong, IBM Plex Sans Thai, IBM Plex Mono
- Testing: jest-expo and @testing-library/react-native

**Spec:** `docs/superpowers/specs/2026-09-29-dschool-ios-redesign-design.md`. Section references like "spec §5.3" point there, and all copy/values there are binding.

## Global Constraints

- **Dependencies:** Expo SDK 57. Add native packages only with `npx expo install <pkg>`, and only modules that ship in Expo Go. No other UI kits.
- **TypeScript:** `strict: true`. Path alias `@/*` → `src/*`, configured in both tsconfig and the Jest `moduleNameMapper`.
- **Copy:** UI copy is Thai only, and every string quoted in spec §5 is used verbatim.
- **Tokens:** colors, type, radii, spacing and motion come only from `src/theme/*` (values per spec §4). No hex literals outside `src/theme/`.
- **Thai line height:** every Thai text style has `lineHeight ≥ 1.2 × fontSize`.
- **One primary button:** at most one `<Button variant="primary">` visible per screen.
- **Flat:** no shadows. The `shadow*` and `elevation` style props are forbidden.
- **Data states:** every data screen renders through `LoadGate` (skeleton / `ErrorState` / content), and every list has an `EmptyState`.
- **Native-only APIs:** haptics, Face ID, camera, brightness, sensors and secure-store are used only through `src/lib/platform.ts`, `src/lib/haptics.ts`, `src/data/pinStorage.ts` or the feature hooks named below. The web preview must never crash.
- **Reduce Motion:** every motion primitive calls Reanimated `useReducedMotion()`. When it's true, it degrades to a 200ms opacity fade, and loops and tilt are disabled.
- **Dates:** format only through `src/lib/format.ts`, using the Buddhist era. Never use `toLocaleDateString` or `Intl` date calendars.
- **Money:** money values are integer baht (`number`) and are displayed only through `formatBaht`.
- **Current time:** "now" is read only through `src/lib/clock.ts` (`now()`). No bare `new Date()` / `Date.now()` in `app/` or `src/` outside `clock.ts`.
- **Placeholder identity:** per spec §2. The demo PIN is `123456` (`DEMO_PIN` in `src/data/seed.ts`).
- **Editing on this machine:** never edit Thai-containing files with PowerShell `Get-Content`/`Set-Content`, because Windows PowerShell 5.1 mis-decodes UTF-8. Use the editor tools, Node or Git Bash.
- **Commits:** commit after every task as `<type>: <summary>`, ending with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

### Shared commands

- **Unit tests:** `npx jest <path>`. The full suite is `npm test -- --ci`.
- **Typecheck:** `npm run typecheck`. Expected: exits 0 with no output.
- **Web bundle check:** `npx expo export -p web --output-dir .export-check`. Expected: the output ends with `Exported: .export-check` and there's no "Unable to resolve".
- **Visual Check (VC):** the procedure every UI task ends with.
  1. Keep `npx expo start --web --port 8081` running in the background.
  2. Open `http://localhost:8081` in the browser pane and resize it to 390×844.
  3. Unlock with PIN `123456`.
  4. For each listed path: navigate to it, screenshot it, switch the color scheme to dark, screenshot again, then switch back.
  5. **Pass means:**
     - the layout matches the cited spec section
     - no clipped Thai marks and no horizontal overflow
     - no red error overlay
     - `read_console_messages` with `onlyErrors` returns nothing new
  6. To toggle demo state before Settings exists, use the dev handle: `globalThis.__app.getState().updateDemo({...})`.

## Review Focus

1. **Custom amount formats:** a top-up amount typed as `"1,000"`, `" 50 "` or Thai digits `"๑๐๐"` should be accepted as 1000, 50 and 100 (tests in Task 5).
2. **Double taps:** double-tapping a submit action (slip upload, leave submit, slip-check claim) must produce exactly one credit or request (tests in Task 8, keyed by `clientId`).
3. **Restart mid-flow:** if the app is killed while a top-up is pending or a leave awaits approval, the overdue items settle on the first `tick` after relaunch (tests in Task 8).
4. **Demo purchase edge cases:** a demo purchase with a frozen card, or with a balance below the price, is rejected with a reason and the balance never goes negative (tests in Task 8).
5. **No school today:** opening the app on a weekend, a holiday or between semesters shows "วันนี้ไม่มีเรียน", defaults to the latest semester, and shows semester 2 as not started (tests in Tasks 4 and 7).

---

## File map (target end state)

```
app/_layout.tsx                 root: fonts, splash, providers, Stack + Protected guards, ToastHost, AlertToaster, ErrorBoundary
app/pin.tsx, app/forgot-pin.tsx
app/(tabs)/_layout.tsx          Tabs with custom TabBar
app/(tabs)/index.tsx | attendance.tsx | qr.tsx (press-intercepted stub) | wallet.tsx | me.tsx
app/qr.tsx  app/topup.tsx  app/wallet-history.tsx  app/slip-check.tsx
app/day/[date].tsx  app/leave/new.tsx  app/leave/[id].tsx
app/behavior.tsx  app/assessments/index.tsx  app/assessments/[id].tsx
app/notifications.tsx  app/announcement/[id].tsx  app/profile.tsx
app/settings/index.tsx  app/settings/change-pin.tsx  app/dev/kit.tsx  app/+not-found.tsx
src/lib/        clock, format, greeting, pin, countdown, attendance, topup, leave, assessment, platform, haptics, brightness, id
src/data/       types, calendar, seed, selectors, store, api, useResource, pinStorage, simulations
src/theme/      tokens, typography, motion, contrast, ThemeProvider
src/components/ui/      Text, Button, Card, Tile, Chip, Segmented, Skeleton, EmptyState, ErrorState, Toast, ProgressSteps,
                        ListRow, ScreenHeader, Screen, LoadGate, ConfirmSheet, Icon, TabBar
src/components/motion/  PressableScale, StaggerIn, NumberTicker, useShake, BorderTrace, PrismShimmer, useTilt, geometry
src/features/<auth|home|wallet|topup|qr|attendance|leave|me|behavior|assessments|notifications>/…
```

---

## Phase 1 — Foundation

### Task 1: Scaffold the Expo app, tooling, and clock

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `jest.config.js`, `jest.setup.ts`, `.gitignore`, `app/_layout.tsx`, `app/index.tsx` (temporary)
- Create: `src/lib/clock.ts`, `src/lib/__tests__/clock.test.ts`

**Interfaces:**
- Produces:
  - `now(): Date`
  - `setClock(fn: (() => Date) | null): void`, used by tests only
  - `toISODate(d: Date): string`, which returns the local `YYYY-MM-DD`

- [ ] **Step 1: Scaffold.**
  1. In the scratchpad, run `npx create-expo-app@latest dschool-scaffold --template blank-typescript --no-install`.
  2. Copy everything except `.git` into the repo root.
  3. Delete `App.tsx` and `index.ts`.
  4. In `package.json`: set `"main": "expo-router/entry"` and `"name": "dschool"`, and add the scripts `"start": "expo start"`, `"web": "expo start --web"`, `"test": "jest"`, `"typecheck": "tsc --noEmit"`.
- [ ] **Step 2: Install.**
  1. Run `npm install`.
  2. Run:
     ```
     npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar react-native-reanimated react-native-worklets react-native-gesture-handler expo-haptics expo-local-authentication expo-camera expo-brightness expo-image-picker expo-clipboard expo-blur expo-linear-gradient expo-sensors expo-secure-store expo-font expo-splash-screen expo-system-ui react-native-svg @react-native-async-storage/async-storage react-dom react-native-web @expo/metro-runtime
     ```
  3. Run `npm install zustand lucide-react-native react-native-qrcode-svg @expo-google-fonts/trirong @expo-google-fonts/ibm-plex-sans-thai @expo-google-fonts/ibm-plex-mono`.
  4. Run `npx expo install jest-expo jest @types/jest @testing-library/react-native -- --save-dev`.
- [ ] **Step 3: Configure `app.json`.**
  - `name "Dschool"`, `slug "dschool"`, `scheme "dschool"`, `userInterfaceStyle "automatic"`
  - `ios.supportsTablet false`, `ios.bundleIdentifier "com.example.dschool"`
  - splash `backgroundColor "#f2f0eb"` (dark `#0f1011`), `web.bundler "metro"`
  - `plugins`:
    - `expo-router`
    - `expo-font`
    - `["expo-local-authentication", {"faceIDPermission": "ใช้ Face ID เพื่อเข้าสู่ระบบ Dschool"}]`
    - `["expo-camera", {"cameraPermission": "ใช้กล้องเพื่อสแกน QR"}]`
    - `["expo-image-picker", {"photosPermission": "เลือกรูปสลิปการโอนเงินหรือใบรับรองแพทย์"}]`
- [ ] **Step 4: Configure TypeScript and Jest.**
  - `tsconfig.json` extends `expo/tsconfig.base` with `strict: true` and `paths {"@/*": ["./src/*"]}`.
  - `jest.config.js`: `preset: 'jest-expo'`, `setupFiles: ['./jest.setup.ts']`, `moduleNameMapper {'^@/(.*)$': '<rootDir>/src/$1'}`, and `transformIgnorePatterns` extended per the jest-expo docs to include `lucide-react-native|react-native-qrcode-svg|@expo-google-fonts/.*`.
  - `jest.setup.ts` sets up Reanimated's Jest support per the Reanimated 4 testing docs (`setUpTests()`), mocks `@react-native-async-storage/async-storage` with its bundled jest mock, and mocks `expo-haptics` as no-ops.
  - `.gitignore` adds `.export-check/`.
- [ ] **Step 5: Write the failing test** `src/lib/__tests__/clock.test.ts`:
  ```ts
  import { now, setClock, toISODate } from '@/lib/clock';
  test('setClock overrides now()', () => {
    setClock(() => new Date(2026, 8, 29, 7, 30));
    expect(now().getFullYear()).toBe(2026);
    expect(toISODate(now())).toBe('2026-09-29');
    setClock(null);
    expect(Math.abs(now().getTime() - Date.now())).toBeLessThan(1000);
  });
  test('toISODate pads month/day', () => {
    expect(toISODate(new Date(2027, 0, 5))).toBe('2027-01-05');
  });
  ```
- [ ] **Step 6:** Run `npx jest src/lib/__tests__/clock.test.ts`. Expected: FAIL, cannot find module `@/lib/clock`.
- [ ] **Step 7:** Implement `src/lib/clock.ts`. `toISODate` uses local date parts.
- [ ] **Step 8:** Run the test again. Expected: PASS.
- [ ] **Step 9: Add temporary routes.** `app/_layout.tsx` is a bare `<Stack screenOptions={{ headerShown: false }} />`, and `app/index.tsx` renders `<Text>Dschool</Text>`. Run `npm run typecheck` and the web bundle check. Expected: both pass.
- [ ] **Step 10:** Commit with `chore: scaffold Expo SDK 57 app with router, jest, and clock`.

### Task 2: Thai formatting and greeting

**Files:**
- Create: `src/lib/format.ts`, `src/lib/greeting.ts`
- Test: `src/lib/__tests__/format.test.ts`, `src/lib/__tests__/greeting.test.ts`

**Interfaces:**
- Consumes: `toISODate` from Task 1.
- Produces:
  - `formatBaht(n: number, opts?: { sign?: boolean }): string`
  - `thaiDate(d: Date, style: 'short' | 'long' | 'weekdayShort' | 'numeric'): string`
  - `timeHM(d: Date): string`
  - `parseISODate(s: string): Date` (local midnight)
  - `relativeTime(at: Date, now: Date): string`
  - `thaiMonthLong(month0: number): string`
  - `THAI_WEEKDAY_SHORT: readonly string[]` (Sunday-first: `['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.']`)
  - `greetingFor(d: Date): string`

- [ ] **Step 1: Write the failing tests.**
  ```ts
  expect(formatBaht(1245)).toBe('฿1,245');
  expect(formatBaht(0)).toBe('฿0');
  expect(formatBaht(1245.5)).toBe('฿1,245.50');
  expect(formatBaht(50, { sign: true })).toBe('+฿50');
  expect(formatBaht(-35, { sign: true })).toBe('−฿35');   // U+2212
  expect(formatBaht(-35)).toBe('−฿35');
  const d = new Date(2026, 8, 29, 7, 5);
  expect(thaiDate(d, 'short')).toBe('29 ก.ย. 2569');
  expect(thaiDate(d, 'long')).toBe('29 กันยายน 2569');
  expect(thaiDate(d, 'weekdayShort')).toBe('อ. 29 ก.ย. 2569');
  expect(thaiDate(d, 'numeric')).toBe('29/09/69');
  expect(timeHM(d)).toBe('07:05');
  expect(toISODate(parseISODate('2026-09-29'))).toBe('2026-09-29');
  const n = new Date(2026, 8, 29, 12, 0);
  expect(relativeTime(new Date(n.getTime() - 30_000), n)).toBe('เมื่อสักครู่');
  expect(relativeTime(new Date(n.getTime() - 5 * 60_000), n)).toBe('5 นาทีที่แล้ว');
  expect(relativeTime(new Date(n.getTime() - 2 * 3_600_000), n)).toBe('2 ชม. ที่แล้ว');
  expect(relativeTime(new Date(2026, 8, 28, 23, 0), n)).toBe('เมื่อวาน');   // 13 h ago but a different calendar day
  expect(relativeTime(new Date(2026, 8, 20, 9, 0), n)).toBe('20 ก.ย. 2569');
  // greeting.test.ts
  expect(greetingFor(new Date(2026, 8, 29, 5, 0))).toBe('สวัสดีตอนเช้า');
  expect(greetingFor(new Date(2026, 8, 29, 11, 59))).toBe('สวัสดีตอนเช้า');
  expect(greetingFor(new Date(2026, 8, 29, 12, 0))).toBe('สวัสดีตอนบ่าย');
  expect(greetingFor(new Date(2026, 8, 29, 17, 0))).toBe('สวัสดีตอนเย็น');
  expect(greetingFor(new Date(2026, 8, 29, 21, 0))).toBe('สวัสดี');
  expect(greetingFor(new Date(2026, 8, 29, 4, 59))).toBe('สวัสดี');
  ```
  **Rule:** the "เมื่อวาน" (yesterday) check comes before the hours check. If `at` falls on the previous calendar day and more than 60 minutes have passed, return "เมื่อวาน". Same day, under 60s: "เมื่อสักครู่". Under 60 minutes: minutes. Under 24h: hours. Two or more days ago: short date.
- [ ] **Step 2:** Run `npx jest src/lib/__tests__/format.test.ts src/lib/__tests__/greeting.test.ts`. Expected: FAIL, modules not found.
- [ ] **Step 3: Implement both files** with hand-written Thai month and weekday arrays (no `Intl`). The BE year is `getFullYear() + 543`. `numeric` uses the 2-digit BE year.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(lib): Thai baht/date formatting and greeting`.

### Task 3: PIN gate and QR countdown

**Files:**
- Create: `src/lib/pin.ts`, `src/lib/countdown.ts`, `src/lib/id.ts`
- Test: `src/lib/__tests__/pin.test.ts`, `src/lib/__tests__/countdown.test.ts`

**Interfaces:**
- Produces:
  - `PIN_LENGTH = 6`, `MAX_ATTEMPTS = 5`, `LOCKOUT_MS = 30_000`
  - `interface PinGate { failures: number; lockedUntil: number | null }`
  - `INITIAL_GATE: PinGate`
  - `checkPin(gate: PinGate, entered: string, actual: string, nowMs: number): { ok: boolean; gate: PinGate; remaining: number; locked: boolean }`
  - `lockRemainingMs(gate: PinGate, nowMs: number): number`
  - `QR_PERIOD_S = 60`
  - `secondsLeft(issuedAtMs: number, nowMs: number, periodS?: number): number`
  - `elapsedFraction(issuedAtMs: number, nowMs: number, periodS?: number): number`
  - `newQrToken(studentId: string, nowMs: number, rand?: () => number): string`
  - `newId(prefix: string, rand?: () => number): string` in `id.ts`, which returns `${prefix}_${8 base36 chars}`

- [ ] **Step 1: Write the failing tests.**
  ```ts
  const t0 = 1_000_000;
  let r = checkPin(INITIAL_GATE, '123456', '123456', t0);
  expect(r).toMatchObject({ ok: true, remaining: 5, locked: false, gate: { failures: 0, lockedUntil: null } });
  r = checkPin(INITIAL_GATE, '000000', '123456', t0);
  expect(r).toMatchObject({ ok: false, remaining: 4, locked: false });
  let g = INITIAL_GATE;
  for (let i = 0; i < 5; i++) g = checkPin(g, '000000', '123456', t0).gate;
  expect(g.lockedUntil).toBe(t0 + 30_000);
  expect(checkPin(g, '123456', '123456', t0 + 29_999)).toMatchObject({ ok: false, locked: true, remaining: 0 });
  expect(lockRemainingMs(g, t0 + 10_000)).toBe(20_000);
  expect(checkPin(g, '123456', '123456', t0 + 30_000)).toMatchObject({ ok: true, gate: { failures: 0, lockedUntil: null } });
  // after lockout expires, a wrong PIN starts a fresh count
  expect(checkPin(g, '000000', '123456', t0 + 30_000).remaining).toBe(4);
  // countdown.test.ts
  expect(secondsLeft(0, 0)).toBe(60);
  expect(secondsLeft(0, 59_001)).toBe(1);
  expect(secondsLeft(0, 60_000)).toBe(0);
  expect(secondsLeft(0, 75_000)).toBe(0);
  expect(elapsedFraction(0, 30_000)).toBeCloseTo(0.5);
  expect(elapsedFraction(0, 90_000)).toBe(1);
  expect(newQrToken('24815', 1_700_000_000_000, () => 0.5)).toMatch(/^DSCH:24815:[a-z0-9]+:[a-z0-9]{6}$/);
  expect(newId('lv', () => 0.25)).toMatch(/^lv_[a-z0-9]{8}$/);
  ```
- [ ] **Step 2:** Run both test files. Expected: FAIL.
- [ ] **Step 3: Implement.** Once `lockedUntil` has passed, any check starts from `INITIAL_GATE`. `secondsLeft = clamp(ceil((periodS*1000 − (now − issued))/1000), 0, periodS)`.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(lib): PIN attempt gate, QR countdown, ids`.

### Task 4: Domain types, school calendar, attendance math

**Files:**
- Create: `src/data/types.ts`, `src/data/calendar.ts`, `src/lib/attendance.ts`
- Test: `src/lib/__tests__/attendance.test.ts`

**Interfaces:**
- Produces `src/data/types.ts`. Later tasks use these exact names:
  ```ts
  export type AttendanceStatus = 'present' | 'late' | 'noScan' | 'sick' | 'personal' | 'absent';
  export type SemesterId = '2569-1' | '2569-2';
  export interface Semester { id: SemesterId; label: string; start: string; end: string }
  export interface AttendanceDay { date: string; status: AttendanceStatus; checkIn: string | null; gate: string | null; note?: string }
  export interface Student { id: string; firstName: string; lastName: string; nickname: string; classroom: string; school: string;
    phone: string | null; guardianName: string | null; guardianPhone: string | null;
    advisor: { name: string; phone: string | null }; deviceId: string; academicYear: number }
  export type TxKind = 'topup' | 'purchase';
  export interface Transaction { id: string; kind: TxKind; amount: number; at: string /* ISO datetime */; title: string; source?: 'slip' | 'qr' | 'card' }
  export interface BankTransfer { id: string; at: string; amount: number; claimed: boolean }
  export interface PendingTopup { id: string; clientId: string; amount: number; dueAt: number }
  export interface Wallet { balance: number; frozen: boolean; transactions: Transaction[]; transfers: BankTransfer[]; pending: PendingTopup[] }
  export type LeaveType = 'sick' | 'personal';
  export type LeaveStatus = 'submitted' | 'approved' | 'recorded' | 'rejected';
  export interface LeaveRequest { id: string; clientId: string; type: LeaveType; start: string; end: string; reason: string;
    photoUri: string | null; status: LeaveStatus; history: { status: LeaveStatus; at: string }[]; createdAt: string; nextAt: number | null }
  export interface BehaviorEvent { id: string; delta: number; title: string; date: string }
  export interface AssessmentQuestion { id: string; text: string; dimension: string; options: { label: string; value: number }[] }
  export interface Assessment { id: 'eq' | 'sdq'; title: string; description: string; questions: AssessmentQuestion[];
    completedAt: string | null; result: Record<string, { score: number; max: number }> | null }
  export type AlertKind = 'topup' | 'leave' | 'announcement' | 'attendance' | 'behavior';
  export interface AppAlert { id: string; kind: AlertKind; title: string; body: string; at: string; read: boolean; link: string }
  export interface Announcement { id: string; category: string; title: string; body: string; at: string }
  export type ThemePref = 'system' | 'light' | 'dark';
  export interface DemoSettings { visible: boolean; networkErrors: boolean; slipMode: 'auto' | 'pending' | 'reject';
    fastLeave: boolean; arrival: 'arrived' | 'notYet' | 'onLeave' }
  export interface Settings { theme: ThemePref; faceId: boolean; notify: Record<AlertKind, boolean>; demo: DemoSettings }
  export type FeatureKey = 'attendance' | 'wallet' | 'behavior' | 'leave' | 'assessments' | 'announcements';
  ```
- Produces `src/data/calendar.ts`:
  - `SEMESTERS: Record<SemesterId, Semester>` = `{'2569-1': {label:'ภาคเรียนที่ 1', start:'2026-05-16', end:'2026-10-10'}, '2569-2': {label:'ภาคเรียนที่ 2', start:'2026-11-01', end:'2027-03-31'}}`
  - `HOLIDAYS: string[]` = `['2026-06-03','2026-07-28','2026-08-12','2026-12-07','2026-12-10','2026-12-31','2027-01-01']`
- Produces `src/lib/attendance.ts`:
  - `STATUS_ORDER: AttendanceStatus[]` (present, late, noScan, sick, personal, absent)
  - `STATUS_LABEL: Record<AttendanceStatus,string>` (มา, สาย, ไม่ลงเวลา, ลาป่วย, ลากิจ, ขาด)
  - `countStatuses(days: AttendanceDay[]): Record<AttendanceStatus, number>`
  - `attendanceRate(c: Record<AttendanceStatus, number>): number`, which returns an integer percent: `round((present+late)/total*100)`, or 0 when empty
  - `onTimeStreak(days: AttendanceDay[]): number`
  - `isSchoolDay(date: string, holidays?: string[]): boolean`
  - `monthGrid(year: number, month0: number): (string | null)[][]`
  - `semesterMonths(s: Semester): { year: number; month0: number }[]`
  - `weekStrip(days: AttendanceDay[], today: string): { date: string; label: string; status: AttendanceStatus | null }[]`
  - `currentSemesterId(today: string): SemesterId`

- [ ] **Step 1: Write the failing tests** (build `AttendanceDay` fixtures with a local helper `day(date, status)`):
  ```ts
  expect(countStatuses([day('2026-09-21','present'), day('2026-09-22','late')])).toEqual({ present:1, late:1, noScan:0, sick:0, personal:0, absent:0 });
  expect(attendanceRate({ present:40, late:2, noScan:1, sick:2, personal:1, absent:0 })).toBe(91);
  expect(attendanceRate({ present:0, late:0, noScan:0, sick:0, personal:0, absent:0 })).toBe(0);
  // streak: counted backward from the latest date; sick/personal are skipped; late/absent/noScan break it; input order doesn't matter
  const seq = ['present','present','late','present','sick','present','present'] as const;
  const days = seq.map((s, i) => day(`2026-09-${String(21 + i).padStart(2,'0')}`, s)).reverse();
  expect(onTimeStreak(days)).toBe(3);
  expect(onTimeStreak([])).toBe(0);
  expect(isSchoolDay('2026-09-26')).toBe(false);          // Saturday
  expect(isSchoolDay('2026-09-28')).toBe(true);           // Monday
  expect(isSchoolDay('2026-07-28')).toBe(false);          // holiday
  const g = monthGrid(2026, 8);                           // Sept 2026 starts on a Tuesday; Monday-first grid
  expect(g[0]).toEqual([null,'2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05','2026-09-06']);
  expect(g.length).toBe(5); expect(g.every(r => r.length === 7)).toBe(true);
  expect(g[4].slice(0,3)).toEqual(['2026-09-28','2026-09-29','2026-09-30']);
  expect(semesterMonths(SEMESTERS['2569-1']).map(m => m.month0)).toEqual([4,5,6,7,8,9]);
  const w = weekStrip([day('2026-09-28','present')], '2026-09-29');
  expect(w.map(x => x.label)).toEqual(['จ','อ','พ','พฤ','ศ']);
  expect(w[0]).toEqual({ date:'2026-09-28', label:'จ', status:'present' });
  expect(w[1].status).toBeNull();
  expect(currentSemesterId('2026-09-29')).toBe('2569-1');
  expect(currentSemesterId('2026-10-20')).toBe('2569-1');   // gap → latest finished
  expect(currentSemesterId('2026-11-02')).toBe('2569-2');
  expect(currentSemesterId('2027-04-10')).toBe('2569-2');
  expect(currentSemesterId('2026-03-01')).toBe('2569-1');   // before year start
  ```
- [ ] **Step 2:** Run `npx jest src/lib/__tests__/attendance.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `types.ts`, `calendar.ts` and `attendance.ts`. Compare dates as `YYYY-MM-DD` strings. `weekStrip` returns the Monday–Friday of the week containing `today`.
- [ ] **Step 4:** Run the tests. Expected: PASS. Then run `npm run typecheck`. Expected: exits 0.
- [ ] **Step 5:** Commit with `feat(lib): domain types, school calendar, attendance math`.

### Task 5: Top-up rules and state machine

**Files:**
- Create: `src/lib/topup.ts`
- Test: `src/lib/__tests__/topup.test.ts`

**Interfaces:**
- Produces:
  - `TOPUP_PRESETS = [20, 50, 100, 200]`, `TOPUP_MIN = 10`, `TOPUP_MAX = 2000`
  - `validateAmount(input: string): { ok: true; amount: number } | { ok: false; error: string }`
  - `type TopupStep = 'amount' | 'transfer' | 'slip' | 'scanning' | 'verified' | 'pending' | 'rejected'`
  - `interface TopupState { step: TopupStep; amount: number | null; slipUri: string | null }`
  - `type TopupEvent = { type: 'SET_AMOUNT'; amount: number | null } | { type: 'NEXT' } | { type: 'BACK' } | { type: 'SLIP_PICKED'; uri: string } | { type: 'SCAN_DONE'; result: 'verified' | 'pending' | 'rejected' } | { type: 'RETRY' }`
  - `initialTopup: TopupState`
  - `topupReducer(s: TopupState, e: TopupEvent): TopupState`
  - `stepIndex(step: TopupStep): 0 | 1 | 2`

- [ ] **Step 1: Write the failing tests.** These include Review Focus #1.
  ```ts
  expect(validateAmount('50')).toEqual({ ok: true, amount: 50 });
  expect(validateAmount(' 50 ')).toEqual({ ok: true, amount: 50 });
  expect(validateAmount('1,000')).toEqual({ ok: true, amount: 1000 });
  expect(validateAmount('๑๐๐')).toEqual({ ok: true, amount: 100 });
  expect(validateAmount('')).toEqual({ ok: false, error: 'ใส่จำนวนเงิน' });
  expect(validateAmount('12.5')).toEqual({ ok: false, error: 'ใส่เป็นจำนวนเต็มบาท' });
  expect(validateAmount('abc')).toEqual({ ok: false, error: 'ใส่เป็นจำนวนเต็มบาท' });
  expect(validateAmount('9')).toEqual({ ok: false, error: 'ขั้นต่ำ ฿10' });
  expect(validateAmount('2001')).toEqual({ ok: false, error: 'สูงสุด ฿2,000' });
  let s = topupReducer(initialTopup, { type: 'NEXT' });
  expect(s.step).toBe('amount');                                   // no amount → stays
  s = topupReducer(topupReducer(initialTopup, { type: 'SET_AMOUNT', amount: 50 }), { type: 'NEXT' });
  expect(s).toEqual({ step: 'transfer', amount: 50, slipUri: null });
  expect(topupReducer(s, { type: 'BACK' }).step).toBe('amount');
  s = topupReducer(s, { type: 'NEXT' });                            // → slip
  s = topupReducer(s, { type: 'SLIP_PICKED', uri: 'demo://slip' });
  expect(s).toEqual({ step: 'scanning', amount: 50, slipUri: 'demo://slip' });
  expect(topupReducer(s, { type: 'BACK' }).step).toBe('scanning'); // BACK ignored while scanning
  expect(topupReducer(s, { type: 'RETRY' })).toEqual({ step: 'slip', amount: 50, slipUri: null }); // network failure mid-scan
  const rej = topupReducer(s, { type: 'SCAN_DONE', result: 'rejected' });
  expect(topupReducer(rej, { type: 'RETRY' })).toEqual({ step: 'slip', amount: 50, slipUri: null });
  expect(topupReducer(s, { type: 'SCAN_DONE', result: 'verified' }).step).toBe('verified');
  expect([stepIndex('amount'), stepIndex('transfer'), stepIndex('pending')]).toEqual([0, 1, 2]);
  ```
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** Map Thai digits `๐-๙` (U+0E50–U+0E59) to ASCII, then strip spaces and commas, then require `/^\d+$/` before the range checks. `RETRY` is valid from `rejected` and `scanning`. Events that don't apply to the current step return the same state object.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(lib): top-up amount validation and flow reducer`.

### Task 6: Leave rules and assessment scoring

**Files:**
- Create: `src/lib/leave.ts`, `src/lib/assessment.ts`
- Test: `src/lib/__tests__/leave.test.ts`, `src/lib/__tests__/assessment.test.ts`

**Interfaces:**
- Consumes: `isSchoolDay` and `HOLIDAYS` from Task 4.
- Produces:
  - `schoolDaysBetween(start: string, end: string, holidays?: string[]): number`, inclusive
  - `validateLeave(i: { type: LeaveType | null; start: string | null; end: string | null; reason: string }): { type?: string; dates?: string; reason?: string }`
  - `LEAVE_STEPS: LeaveStatus[] = ['submitted','approved','recorded']`
  - `LEAVE_STEP_LABEL: Record<'submitted'|'approved'|'recorded', string>` (ส่งใบลาแล้ว, ครูที่ปรึกษาอนุมัติ, บันทึกในระบบแล้ว)
  - `nextLeaveStatus(s: LeaveStatus): LeaveStatus | null`
  - `leaveDelayMs(from: LeaveStatus, fast: boolean): number`
  - `scoreAssessment(a: Assessment, answers: Record<string, number>): Record<string, { score: number; max: number }>`

- [ ] **Step 1: Write the failing tests.**
  ```ts
  expect(schoolDaysBetween('2026-09-28', '2026-10-02')).toBe(5);
  expect(schoolDaysBetween('2026-09-25', '2026-09-28')).toBe(2);   // Fri + Mon
  expect(schoolDaysBetween('2026-07-27', '2026-07-29')).toBe(2);   // 28th holiday
  expect(schoolDaysBetween('2026-09-29', '2026-09-28')).toBe(0);
  expect(schoolDaysBetween('2026-09-26', '2026-09-27')).toBe(0);
  const ok = { type: 'sick' as const, start: '2026-09-28', end: '2026-09-29', reason: 'ไข้หวัดใหญ่' };
  expect(validateLeave(ok)).toEqual({});
  expect(validateLeave({ ...ok, type: null }).type).toBe('เลือกประเภทการลา');
  expect(validateLeave({ ...ok, start: null }).dates).toBe('เลือกวันที่ลา');
  expect(validateLeave({ ...ok, start: '2026-09-26', end: '2026-09-27' }).dates).toBe('ช่วงวันที่นี้ไม่มีวันเรียน');
  expect(validateLeave({ ...ok, reason: '  ปวด ' }).reason).toBe('ระบุเหตุผลอย่างน้อย 5 ตัวอักษร');
  expect(validateLeave({ ...ok, reason: 'ก'.repeat(301) }).reason).toBe('ไม่เกิน 300 ตัวอักษร');
  expect([nextLeaveStatus('submitted'), nextLeaveStatus('approved'), nextLeaveStatus('recorded'), nextLeaveStatus('rejected')])
    .toEqual(['approved', 'recorded', null, null]);
  expect([leaveDelayMs('submitted', false), leaveDelayMs('submitted', true), leaveDelayMs('approved', false), leaveDelayMs('approved', true)])
    .toEqual([30_000, 5_000, 10_000, 3_000]);
  // assessment.test.ts: 3 questions, dims A (2 q, options 0..2) and B (1 q, options 1..4)
  expect(scoreAssessment(fixture, { q1: 2, q2: 1, q3: 4 })).toEqual({ A: { score: 3, max: 4 }, B: { score: 4, max: 4 } });
  expect(scoreAssessment(fixture, { q1: 2 })).toEqual({ A: { score: 2, max: 4 }, B: { score: 0, max: 4 } });
  ```
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** Reason length is `[...reason.trim()].length` (code points). `leaveDelayMs` for any status other than submitted/approved returns 0.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(lib): leave rules and assessment scoring`.

### Task 7: Seed data and selectors

**Files:**
- Create: `src/data/seed.ts`, `src/data/selectors.ts`
- Test: `src/data/__tests__/seed.test.ts`, `src/data/__tests__/selectors.test.ts`

**Interfaces:**
- Consumes: Tasks 1–6.
- Produces `seed.ts`:
  - `DEMO_PIN = '123456'`
  - `SCHOOL_ACCOUNT = { bank: 'ธนาคารตัวอย่าง', number: '123-4-56789-0', name: 'โรงเรียนตัวอย่างวิทยา' }`
  - `DEFAULT_SETTINGS: Settings` (theme 'system', faceId true, all notify true, demo `{visible:false, networkErrors:false, slipMode:'auto', fastLeave:false, arrival:'arrived'}`)
  - `interface AppData { student; wallet: Wallet; attendance: Record<SemesterId, AttendanceDay[]>; leaves: LeaveRequest[]; behavior: BehaviorEvent[]; assessments: Assessment[]; alerts: AppAlert[]; announcements: Announcement[] }`
  - `buildSeed(now: Date): AppData`
- Produces `selectors.ts`:
  - `type TodayInfo = { kind: 'arrived'; checkIn: string; onTime: boolean } | { kind: 'notYet'; gateClose: string } | { kind: 'onLeave'; leaveType: LeaveType } | { kind: 'noSchool' }`
  - `todayInfo(d: AppData, demo: DemoSettings, now: Date): TodayInfo`
  - `semesterDays(d: AppData, id: SemesterId, demo: DemoSettings, now: Date): AttendanceDay[]`
  - `semesterStarted(id: SemesterId, now: Date): boolean`
  - `unreadCount(alerts: AppAlert[]): number`
  - `spendByDay(tx: Transaction[], now: Date, days?: number): { date: string; total: number }[]` (oldest first, purchases only)
  - `spentToday(tx: Transaction[], now: Date): number`
  - `groupByDay(tx: Transaction[]): { date: string; items: Transaction[] }[]` (newest first)
  - `behaviorScore(events: BehaviorEvent[]): number` (`min(100, 100 + Σdelta)`)
  - `pendingLeaves(l: LeaveRequest[]): number`
  - `dueAssessments(a: Assessment[]): number`

**Seed decisions:**
- **Randomness:** a mulberry32 PRNG seeded with `2569`.
- **Student:** `{id:'24815', firstName:'ภูมิภัทร', lastName:'ศรีสุข', nickname:'ภูมิ', classroom:'ม.5/3', school:'โรงเรียนตัวอย่างวิทยา', phone:null, guardianName:'นางสมศรี ศรีสุข', guardianPhone:'081-234-5678', advisor:{name:'ครูวรรณา ใจดี', phone:'089-765-4321'}, deviceId:'DS-7F3A-24815', academicYear:2569}`.
- **Attendance:**
  - One entry per school day from each semester's start through the day before `now` (clamped to the semester end), with `gate` set to `'ประตู 1'`.
  - Status weights: present 88%, late 5%, noScan 2%, sick 3%, personal 1%, absent 1%.
  - Check-ins: present days get `07:10–07:55`, late days get `08:05–08:40`.
  - The last 12 school days are forced to present.
- **Transactions:**
  - The last 30 days of school days. Purchases are 1–3 per day ("ร้านข้าวมันไก่ป้าน้อย" ฿35–45 around 12:00, "ร้านน้ำหวานลุงชัย" ฿10–20 around 14:30). Top-ups are ฿40 or ฿50 via slip at around 11:30.
  - One opening top-up of ฿1,000 on the first day.
  - The balance equals the signed sum of all transactions.
- **Transfers:** 5 unclaimed bank-side transfers from the last 3 days (฿10–80), newest first.
- **Behavior:** `[−5 'แต่งกายผิดระเบียบ' 2026-06-18, +5 'จิตอาสาทำความสะอาด' 2026-08-20]`.
- **Leaves:** none.
- **Assessments:** two, both not completed. Every question is original and generic; none are copied from the SDQ or EQ instruments.
  - `eq`: 'แบบประเมินความฉลาดทางอารมณ์ (EQ)', 10 questions. Options ไม่จริง=1 / จริงบางครั้ง=2 / ค่อนข้างจริง=3 / จริงมาก=4. Dimensions ดี / เก่ง / สุข.
  - `sdq`: 'แบบสำรวจจุดแข็งและความยากลำบาก (ตัวอย่าง)', 10 questions. Options ไม่จริง=0 / จริงบางครั้ง=1 / จริงแน่นอน=2. Dimensions อารมณ์ / เพื่อน / สมาธิ / น้ำใจ.
- **Announcements:** 5, dated relative to `now`:
  - ประชุมผู้ปกครอง
  - สอบปลายภาค 5–9 ต.ค.
  - ปิดภาคเรียน 11–31 ต.ค.
  - กีฬาสีภายใน
  - เปิดใช้ระบบเติมเงินผ่านสลิป
- **Alerts:** 4 alerts, the 2 newest unread. Each link is a valid route: `/wallet`, `/attendance` or `/announcement/<id>`.

- [ ] **Step 1: Write the failing tests** (`const N = new Date(2026, 8, 29, 9, 0)`, a Tuesday; define a local `leaveFixture: LeaveRequest` with every field filled):
  ```ts
  expect(buildSeed(N)).toEqual(buildSeed(N));
  const s = buildSeed(N);
  const signed = s.wallet.transactions.reduce((a, t) => a + (t.kind === 'topup' ? t.amount : -t.amount), 0);
  expect(s.wallet.balance).toBe(signed); expect(s.wallet.balance).toBeGreaterThan(0);
  const d1 = s.attendance['2569-1'];
  expect(d1[0].date).toBe('2026-05-18');                                      // 16th is a Saturday
  expect(d1.at(-1)!.date).toBe('2026-09-28');                                 // day before N
  expect(d1.every(d => isSchoolDay(d.date))).toBe(true);
  expect(d1.filter(d => d.status === 'present').length / d1.length).toBeGreaterThan(0.8);
  expect(onTimeStreak(d1)).toBeGreaterThanOrEqual(12);
  expect(s.attendance['2569-2']).toEqual([]);
  expect(s.student).toMatchObject({ firstName: 'ภูมิภัทร', classroom: 'ม.5/3', id: '24815' });
  expect(s.wallet.transfers).toHaveLength(5); expect(s.wallet.transfers.every(t => !t.claimed)).toBe(true);
  expect(behaviorScore(s.behavior)).toBe(100);
  // selectors.test.ts (Review Focus #5)
  const demo = DEFAULT_SETTINGS.demo;
  expect(todayInfo(s, demo, N)).toEqual({ kind: 'arrived', checkIn: '07:32', onTime: true });
  expect(todayInfo(s, { ...demo, arrival: 'notYet' }, N)).toEqual({ kind: 'notYet', gateClose: '08:00' });
  expect(todayInfo(s, { ...demo, arrival: 'onLeave' }, N)).toEqual({ kind: 'onLeave', leaveType: 'sick' });
  expect(todayInfo(s, demo, new Date(2026, 8, 26, 9))).toEqual({ kind: 'noSchool' });  // Saturday
  expect(todayInfo(s, demo, new Date(2026, 6, 28, 9))).toEqual({ kind: 'noSchool' });  // holiday
  expect(todayInfo(s, demo, new Date(2026, 9, 20, 9))).toEqual({ kind: 'noSchool' });  // between semesters
  const approved = { ...s, leaves: [{ ...leaveFixture, type: 'personal', start: '2026-09-29', end: '2026-09-29', status: 'approved' }] };
  expect(todayInfo(approved, demo, N)).toEqual({ kind: 'onLeave', leaveType: 'personal' });
  expect(semesterDays(s, '2569-1', demo, N).at(-1)).toMatchObject({ date: '2026-09-29', status: 'present', checkIn: '07:32' });
  expect(semesterDays(s, '2569-1', { ...demo, arrival: 'notYet' }, N).at(-1)!.date).toBe('2026-09-28');
  expect(semesterStarted('2569-2', N)).toBe(false);
  expect(spendByDay(s.wallet.transactions, N)).toHaveLength(7);
  expect(groupByDay(s.wallet.transactions)[0].date >= groupByDay(s.wallet.transactions)[1].date).toBe(true);
  ```
- [ ] **Step 2:** Run `npx jest src/data`. Expected: FAIL.
- [ ] **Step 3: Implement** `seed.ts` and `selectors.ts`. Approved or recorded leaves covering today take precedence in `todayInfo`. `semesterDays` appends today only when `todayInfo.kind === 'arrived'` and today is inside the semester.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(data): deterministic seed and selectors`.

### Task 8: Store, fake API, resource hook, PIN storage, simulations

**Files:**
- Create: `src/data/store.ts`, `src/data/api.ts`, `src/data/useResource.ts`, `src/data/pinStorage.ts`, `src/data/simulations.ts`, `src/lib/platform.ts`
- Test: `src/data/__tests__/store.test.ts`, `src/data/__tests__/api.test.ts`, `src/data/__tests__/useResource.test.tsx`

**Interfaces:**
- Consumes: Tasks 3–7.
- Produces `platform.ts`: `isNative: boolean` and `isWeb: boolean`.
- Produces `store.ts`:
  ```ts
  export interface AppState extends AppData {
    settings: Settings; pinGate: PinGate; unlocked: boolean; hydrated: boolean; processed: string[];
    unlock(): void; lock(): void; setPinGate(g: PinGate): void;
    submitSlip(p: { clientId: string; amount: number; nowMs: number }): 'verified' | 'pending' | 'rejected';
    claimTransfer(id: string, nowMs: number): boolean;
    purchase(p: { amount: number; title: string; nowMs: number }): { ok: true } | { ok: false; reason: 'frozen' | 'insufficient' };
    setFrozen(frozen: boolean): void;
    submitLeave(p: { clientId: string; type: LeaveType; start: string; end: string; reason: string; photoUri: string | null; nowMs: number }): LeaveRequest;
    completeAssessment(id: Assessment['id'], answers: Record<string, number>, nowMs: number): void;
    markRead(id: string): void; markAllRead(): void;
    updateSettings(p: Partial<Omit<Settings, 'demo'>>): void; updateDemo(p: Partial<DemoSettings>): void;
    tick(nowMs: number): void;
    resetDemo(nowMs: number): void;
  }
  export function createAppStore(initial: AppData, opts?: { storage?: StateStorage; persist?: boolean }): StoreApi<AppState>;
  export const appStore: StoreApi<AppState>;                         // persisted singleton seeded from buildSeed(now())
  export function useApp<T>(selector: (s: AppState) => T): T;        // bound hook (useStore + useShallow where selecting objects)
  ```
- Produces `api.ts`:
  - `class ApiError extends Error { code: 'network' }`
  - `load(key: string, store?: StoreApi<AppState>): Promise<void>`, which delays a random 350–900ms and rejects with `ApiError` when `settings.demo.networkErrors`
- Produces `useResource.ts`: `useResource(key: string): { status: 'loading' | 'error' | 'ready'; retry(): void; refreshing: boolean; refresh(): Promise<void> }`. It keeps a module-level `Set` of keys already loaded, so a repeat mount starts `ready`.
- Produces `pinStorage.ts`: `getPin(): Promise<string>` (default `DEMO_PIN`) and `setPin(pin: string): Promise<void>`. It uses expo-secure-store key `dschool.pin` when `isNative`, otherwise AsyncStorage.
- Produces `simulations.ts`: `startSimulations(store: StoreApi<AppState>): () => void`, which runs `setInterval(() => store.getState().tick(now().getTime()), 1000)` and returns a stop function.

**Store rules:**
- **Duplicates:** every mutation that takes a `clientId` returns early if `processed` already contains it (Review Focus #2). `processed` is capped at the last 100 ids.
- **`submitSlip`:**
  - `auto`: credits now, adds tx `{kind:'topup', source:'slip', title:'เติมเงินผ่านสลิป'}` and a `topup` alert ("เติมเงิน ฿50 สำเร็จ").
  - `pending`: pushes `PendingTopup` with `dueAt = nowMs + 20_000`.
  - `reject`: no change.
- **`tick`:**
  - Settles every pending top-up with `dueAt ≤ nowMs` (credit + alert).
  - Advances every leave with `nextAt ≤ nowMs` via `nextLeaveStatus`: pushes history and a `leave` alert, then sets `nextAt = nowMs + leaveDelayMs(newStatus, demo.fastLeave)`, or `null` when final.
  - When a leave becomes `approved`, it upserts attendance days for each school day in range (current semester) with status = leave type and note = reason.
- **`submitLeave`:** status `submitted`, `nextAt = nowMs + leaveDelayMs('submitted', fastLeave)`, id `newId('lv')`, plus a `leave` alert "ส่งใบลาแล้ว".
- **Alerts:** new alerts are prepended, so `alerts[0]` is the newest. An alert whose `settings.notify[kind]` is false is stored with `read: true`.
- **`purchase`:** fails with `frozen` first, then `insufficient`. On success it adds tx `{kind:'purchase', source:'qr'}`.
- **`resetDemo`:** replaces all `AppData` with `buildSeed(new Date(nowMs))`, clears `processed`, resets `pinGate`, and keeps `settings.theme` and `settings.demo.visible`.
- **Persistence:** `persist` with `createJSONStorage(() => AsyncStorage)`, name `dschool-app-v1`, version 1. `partialize` drops `unlocked` and `hydrated`, and `onRehydrateStorage` sets `hydrated: true`.
- **Dev handle:** in `__DEV__`, set `globalThis.__app = appStore`.

- [ ] **Step 1: Write the failing store tests** (`const T = new Date(2026, 8, 29, 9).getTime()`, `const seedWallet = buildSeed(new Date(T)).wallet`, `st = createAppStore(buildSeed(new Date(T)), { persist: false })`):
  ```ts
  const b0 = st.getState().wallet.balance;
  expect(st.getState().submitSlip({ clientId: 'c1', amount: 50, nowMs: T })).toBe('verified');
  st.getState().submitSlip({ clientId: 'c1', amount: 50, nowMs: T });
  expect(st.getState().wallet.balance).toBe(b0 + 50);                          // RF#2 idempotent
  expect(st.getState().alerts[0]).toMatchObject({ kind: 'topup', read: false, link: '/wallet' });
  st.getState().updateDemo({ slipMode: 'pending' });
  expect(st.getState().submitSlip({ clientId: 'c2', amount: 40, nowMs: T })).toBe('pending');
  st.getState().tick(T + 19_999); expect(st.getState().wallet.balance).toBe(b0 + 50);
  st.getState().tick(T + 20_000); expect(st.getState().wallet.balance).toBe(b0 + 90);
  expect(st.getState().wallet.pending).toHaveLength(0);
  // RF#3: rehydrated state with an overdue pending item settles on first tick
  const st2 = createAppStore({ ...buildSeed(new Date(T)), wallet: { ...seedWallet, pending: [{ id: 'p', clientId: 'x', amount: 30, dueAt: T - 1 }] } }, { persist: false });
  st2.getState().tick(T); expect(st2.getState().wallet.balance).toBe(seedWallet.balance + 30);
  st.getState().updateDemo({ slipMode: 'reject' });
  expect(st.getState().submitSlip({ clientId: 'c3', amount: 40, nowMs: T })).toBe('rejected');
  // RF#4
  st.getState().setFrozen(true);
  expect(st.getState().purchase({ amount: 35, title: 'x', nowMs: T })).toEqual({ ok: false, reason: 'frozen' });
  st.getState().setFrozen(false);
  expect(st.getState().purchase({ amount: 999_999, title: 'x', nowMs: T })).toEqual({ ok: false, reason: 'insufficient' });
  expect(st.getState().wallet.balance).toBeGreaterThanOrEqual(0);
  const tr = st.getState().wallet.transfers[0];
  expect(st.getState().claimTransfer(tr.id, T)).toBe(true); expect(st.getState().claimTransfer(tr.id, T)).toBe(false);
  const lv = st.getState().submitLeave({ clientId: 'L1', type: 'sick', start: '2026-09-30', end: '2026-10-01', reason: 'ไข้หวัดใหญ่', photoUri: null, nowMs: T });
  st.getState().submitLeave({ clientId: 'L1', type: 'sick', start: '2026-09-30', end: '2026-10-01', reason: 'ไข้หวัดใหญ่', photoUri: null, nowMs: T });
  expect(st.getState().leaves).toHaveLength(1);                               // RF#2
  expect(lv.nextAt).toBe(T + 30_000);
  st.getState().tick(T + 30_000);
  expect(st.getState().leaves[0]).toMatchObject({ status: 'approved', nextAt: T + 40_000 });
  expect(st.getState().attendance['2569-1'].find(d => d.date === '2026-09-30')?.status).toBe('sick');
  st.getState().tick(T + 40_000);
  expect(st.getState().leaves[0]).toMatchObject({ status: 'recorded', nextAt: null });
  st.getState().updateSettings({ notify: { ...DEFAULT_SETTINGS.notify, topup: false } });
  st.getState().updateDemo({ slipMode: 'auto' });
  st.getState().submitSlip({ clientId: 'c4', amount: 20, nowMs: T });
  expect(st.getState().alerts[0].read).toBe(true);
  st.getState().markAllRead(); expect(unreadCount(st.getState().alerts)).toBe(0);
  st.getState().updateSettings({ theme: 'dark' }); st.getState().resetDemo(T);
  expect(st.getState().settings.theme).toBe('dark'); expect(st.getState().leaves).toHaveLength(0);
  ```
- [ ] **Step 2: Write the failing API and hook tests** (fake timers):
  - `load('home', st)` resolves after advancing 900ms.
  - With `networkErrors: true` it rejects with `ApiError`.
  - `renderHook(() => useResource('k'))` starts as `loading` and reaches `ready`. Under errors it reaches `error`. `retry()` after clearing errors reaches `ready`.
- [ ] **Step 3:** Run `npx jest src/data`. Expected: the new tests FAIL.
- [ ] **Step 4: Implement** `platform.ts`, `store.ts`, `api.ts`, `useResource.ts`, `pinStorage.ts` and `simulations.ts`.
- [ ] **Step 5:** Run `npx jest src/data` and `npm run typecheck`. Expected: PASS, and typecheck exits 0.
- [ ] **Step 6:** Commit with `feat(data): persisted store, fake API, resource hook, simulations`.

### Task 9: Theme system, haptics, and root providers

**Files:**
- Create: `src/theme/tokens.ts`, `src/theme/typography.ts`, `src/theme/motion.ts`, `src/theme/contrast.ts`, `src/theme/ThemeProvider.tsx`, `src/lib/haptics.ts`
- Modify: `app/_layout.tsx`
- Test: `src/theme/__tests__/theme.test.ts`

**Interfaces:**
- Consumes: `useApp` and `appStore` (Task 8), `startSimulations` (Task 8).
- Produces `tokens.ts`:
  - `interface ColorTokens { canvas; card; cardRaised; hairline; text; textSecondary; primary; onPrimary; secondary; onSecondary; link; pressed; idCardBg; idCardText; danger; success; warning }`
  - `palette: { light: ColorTokens; dark: ColorTokens }`, with values from spec §4.1. Additions:
    - light: `cardRaised #ffffff`, `idCardBg #421d24`, `idCardText #ffffff`
    - dark: `idCardBg #2e2e2e`, `idCardText #f5f5f7`
    - `danger`/`success`/`warning` = the absent/present/late colors
  - `feature: Record<FeatureKey, { fill: string; ink: string }>`, per spec §4.1 (Attendance ink `#16123f`)
  - `statusColor: Record<AttendanceStatus, string>`
  - `prism: [string, string, string]` = `['#ff2a2a', '#2a7fff', '#2aff2a']`
  - `space = { xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, x3:32, x4:40, x5:48 }`, with `screenPad = 20`
  - `radius = { tile:28, card:16, button:16, input:12, chip:999, sheet:28 }`
- Produces `typography.ts`:
  - `FONT_ASSETS` (the object passed to `useFonts`, with keys `Trirong_300Light`, `Trirong_300Light_Italic`, `IBMPlexSansThai_400Regular`, `IBMPlexSansThai_500Medium`, `IBMPlexMono_400Regular`, `IBMPlexMono_500Medium`; verify the exact export names against the installed packages)
  - `type TypeVariant = 'display' | 'displayItalic' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'data' | 'eyebrow'`
  - `typeScale: Record<TypeVariant, { fontFamily: string; fontSize: number; lineHeight: number; letterSpacing?: number }>`, per spec §4.2 (`data` defaults to 16/22)
- Produces `motion.ts`:
  - `dur = { fast: 200, base: 450, slow: 1400, shimmer: 6650 }`
  - `ease = { standard: Easing.ease, base: Easing.bezier(0.52, 0.01, 0, 1), slow: Easing.bezier(0.455, 0.03, 0.515, 0.955) }`
  - `spring = { damping: 20, stiffness: 180, overshootClamping: true }`
  - `STAGGER_MS = 40`, `STAGGER_MAX = 8`, `PRESS_SCALE = 0.97`
- Produces `contrast.ts`: `contrastRatio(hexA: string, hexB: string): number`.
- Produces `ThemeProvider.tsx`:
  - `resolveScheme(pref: ThemePref, system: 'light' | 'dark' | null | undefined): 'light' | 'dark'`
  - `ThemeProvider({ children })`
  - `useTheme(): { scheme: 'light' | 'dark'; c: ColorTokens; feature; statusColor; space; radius; type: typeof typeScale }`
- Produces `haptics.ts`: `haptic = { selection(): void; light(): void; success(): void; error(): void }`, all no-ops on web.

- [ ] **Step 1: Write the failing tests.**
  ```ts
  expect(resolveScheme('system', 'dark')).toBe('dark');
  expect(resolveScheme('system', null)).toBe('light');
  expect(resolveScheme('light', 'dark')).toBe('light');
  expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  for (const m of ['light', 'dark'] as const) {
    const c = palette[m];
    expect(contrastRatio(c.text, c.canvas)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(c.textSecondary, c.canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.textSecondary, c.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.link, c.canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.idCardText, c.idCardBg)).toBeGreaterThanOrEqual(4.5);
  }
  for (const f of Object.values(feature)) expect(contrastRatio(f.ink, f.fill)).toBeGreaterThanOrEqual(4.5);
  for (const v of Object.values(typeScale)) expect(v.lineHeight / v.fontSize).toBeGreaterThanOrEqual(1.2);
  ```
- [ ] **Step 2:** Run `npx jest src/theme`. Expected: FAIL.
- [ ] **Step 3: Implement the theme files and `haptics.ts`.** `ThemeProvider` reads `settings.theme` via `useApp` and the system scheme via `useColorScheme()`.
- [ ] **Step 4: Rewrite `app/_layout.tsx`.**
  - Call `SplashScreen.preventAutoHideAsync()` at module scope and `useFonts(FONT_ASSETS)`.
  - Hide the splash once fonts are loaded and `hydrated` is true.
  - Nesting: `GestureHandlerRootView` → `SafeAreaProvider` → `ThemeProvider` → `<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.canvas } }} />`.
  - `<StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />`.
  - `useEffect(() => startSimulations(appStore), [])`.
  - Set the root view background with `expo-system-ui` `setBackgroundColorAsync(c.canvas)`.
- [ ] **Step 5:** Run the tests, typecheck and the web bundle check. Expected: all pass.
- [ ] **Step 6:** Commit with `feat(theme): tokens, typography, motion, contrast-checked palettes, providers`.

### Task 10: Motion primitives

**Files:**
- Create: `src/components/motion/geometry.ts`, `PressableScale.tsx`, `StaggerIn.tsx`, `NumberTicker.tsx`, `useShake.ts`, `BorderTrace.tsx`, `PrismShimmer.tsx`, `useTilt.ts`, `index.ts`
- Test: `src/components/motion/__tests__/geometry.test.ts`, `src/components/motion/__tests__/NumberTicker.test.tsx`

**Interfaces:**
- Consumes: `dur`, `ease`, `spring`, `STAGGER_MS`, `STAGGER_MAX`, `PRESS_SCALE`, `prism` (Task 9), and `haptic` (Task 9).
- Produces:
  - `roundedRectPerimeter(w: number, h: number, r: number): number`
  - `roundedRectPath(w: number, h: number, r: number, inset?: number): string`, a path starting at top-center (`M w/2 inset`) and running clockwise
  - `PressableScale(props: PressableProps & { scaleTo?: number; haptic?: 'selection' | 'light' | false })`
  - `StaggerIn({ index, children, style? })`: fade plus a 12pt rise, delay `min(index, STAGGER_MAX) * STAGGER_MS`, `dur.base`/`ease.base`
  - `NumberTicker({ value, format, variant = 'data', style?, from? })`: animates from `from ?? previous value` to `value` over `dur.base`, rendering `format(Math.round(n))`
  - `useShake(): { style: AnimatedStyle; shake(): void }`: 4 cycles, ±8pt, 320ms total
  - `BorderTrace({ width, height, radius, color, strokeWidth = 2, mode, durationMs, cycleKey?, onDone? })`: `mode 'once'` draws 0→full (default duration `dur.base * 2`) and then calls `onDone`. `mode 'countdown'` depletes full→0 over `durationMs` and restarts when `cycleKey` changes. Implemented with `react-native-svg` `Path` plus an animated `strokeDashoffset`.
  - `useTilt(): SharedValue<number>`, in −1…1 from expo-sensors `DeviceMotion.rotation.gamma`. It's 0 on web and under reduced motion, and updates every 60ms.
  - `PrismShimmer({ radius, intensity = 0.18 })`: an absolute-fill `LinearGradient` band in the three prism colors, translating across the card on a `dur.shimmer` linear loop, offset by `tilt × 24` pt. It renders nothing under reduced motion.
- **Reduce Motion:** every component checks `useReducedMotion()`. Under reduced motion, `NumberTicker` renders the final value immediately, `BorderTrace` fades in fully over 200ms and calls `onDone`, and `useShake` does nothing.

- [ ] **Step 1: Write the failing tests.**
  ```ts
  expect(roundedRectPerimeter(100, 50, 10)).toBeCloseTo(300 - 80 + 2 * Math.PI * 10, 3);
  expect(roundedRectPath(100, 50, 10).startsWith('M 50 0')).toBe(true);
  // NumberTicker.test.tsx — mock useReducedMotion → true
  const { getByText } = render(<NumberTicker value={1245} format={formatBaht} />);
  expect(getByText('฿1,245')).toBeTruthy();
  ```
- [ ] **Step 2:** Run `npx jest src/components/motion`. Expected: FAIL.
- [ ] **Step 3: Implement all primitives** and re-export them from `index.ts`.
- [ ] **Step 4:** Run the tests and typecheck. Expected: PASS.
- [ ] **Step 5:** Commit with `feat(motion): press, stagger, ticker, shake, border trace, prism shimmer`.

### Task 11: UI kit and dev gallery

**Files:**
- Create in `src/components/ui/`: `Text.tsx`, `Button.tsx`, `Card.tsx`, `Tile.tsx`, `Chip.tsx`, `Segmented.tsx`, `Skeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `Toast.tsx`, `ProgressSteps.tsx`, `ListRow.tsx`, `ScreenHeader.tsx`, `Screen.tsx`, `LoadGate.tsx`, `ConfirmSheet.tsx`, `Icon.tsx`, `index.ts`
- Create: `app/dev/kit.tsx`
- Create: `src/test/renderWithTheme.tsx` (RNTL `render` wrapped in `SafeAreaProvider` + `ThemeProvider`, using the singleton `appStore`)
- Test: `src/components/ui/__tests__/kit.test.tsx`

**Interfaces:**
- Consumes: Tasks 9 and 10.
- Produces these props. Each component uses only theme tokens.
  - `Text({ variant = 'body', tone = 'primary' | 'secondary' | 'link' | 'onPrimary' | 'inherit', color?, size?, ...TextProps })`: uses `maxFontSizeMultiplier` 1.4 for display/title and 1.8 otherwise. `size` overrides `fontSize` and sets `lineHeight = Math.round(size * 1.25)`. Every "`data` 28"-style reference in this plan means `variant="data" size={28}`.
  - `Button({ title, onPress, variant = 'secondary', icon?, loading?, accessibilityHint?, style? })`
    - height 52, `radius.button`, `label` type
    - primary: `c.primary`/`c.onPrimary`; secondary: `c.secondary`/`c.onSecondary`; ghost: transparent/`c.text`
    - while `loading`, shows an `ActivityIndicator` and ignores presses
  - `Card({ children, onPress?, style?, padded = true })`: `c.card`, 1px `c.hairline` border, `radius.card`, padding 16.
  - `Tile({ feature, icon, label, value?, caption?, onPress })`: fill/ink from `feature[f]`, `radius.tile`, `minHeight` 132 (never a fixed height), value in `data` 28.
  - `Chip({ label, selected?, onPress?, size = 'md' | 'lg' })`: pill shape. Selected uses `c.primary` with `c.onPrimary`. `lg` is 56pt tall and full width.
  - `Segmented<T extends string>({ options: { value: T; label: string }[], value: T, onChange(v: T) })`: the thumb slides with `ease.base`, and each option has `accessibilityState.selected`.
  - `Skeleton({ width, height, radius? })`: a shimmer placeholder, static under reduced motion.
  - `EmptyState({ feature, icon, title, body?, actionLabel?, onAction? })`: the action is a `secondary` Button.
  - `ErrorState({ onRetry })`: copy "โหลดข้อมูลไม่สำเร็จ" / "ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง" / a "ลองอีกครั้ง" button.
  - `toast(message: string, opts?: { kind?: 'info' | 'success' | 'error'; href?: string })` plus `<ToastHost />`: top-anchored under the safe area, slides down with `ease.base`, auto-hides after 2600ms, and tapping it navigates to `href`.
  - `ProgressSteps({ steps: string[]; current: number })`.
  - `ListRow({ icon?, iconColor?, title, subtitle?, value?, onPress?, chevron = !!onPress, right? })`: min height 56.
  - `ScreenHeader({ eyebrow?, title, italicWord?, back?, right? })`: `title` is Trirong `title`, and `italicWord` renders in `displayItalic` on the next line. `back` shows a chevron button that calls `router.back()`.
  - `Screen({ children, header?, title?, onRefresh?, refreshing?, scroll = true, padded = true })`: a SafeArea top inset plus a ScrollView with `RefreshControl` and bottom padding 120 (clears the tab bar). When `title` is set, a compact bar (safe-area inset + 44pt, `BlurView` intensity 40, 1px bottom `c.hairline`, title in `label`) fades in once the scroll offset passes 48pt (spec §4.3). Screens that render a `ScreenHeader` pass the same title.
  - `LoadGate({ status, retry, skeleton, children })`: content fades in over `dur.fast`.
  - `ConfirmSheet({ visible, title, body, confirmLabel, destructive?, onConfirm, onCancel })`: a transparent RN `Modal` with a backdrop and a bottom card sliding up (`ease.base`). The confirm button is primary (danger color when `destructive`), and cancel is a ghost "ยกเลิก".
  - `Icon.tsx`: re-exports the lucide icons used across the app, with a default `strokeWidth={1.75}`. Also `FEATURE_ICON: Record<FeatureKey, LucideIcon>` = attendance `CalendarCheck`, wallet `Wallet`, behavior `ShieldCheck`, leave `FileText`, assessments `ClipboardList`, announcements `Megaphone`.
- `app/dev/kit.tsx` renders every component in both variants. It uses the longest realistic strings ("มาตรงเวลาติดต่อกัน 12 วัน", "ยังไม่มีใบลาในภาคเรียนนี้") inside 2-column tiles at 390 width.

- [ ] **Step 1: Write the failing tests.**
  ```ts
  const onPress = jest.fn();
  render(<Button title="ถัดไป" onPress={onPress} />);
  fireEvent.press(screen.getByRole('button', { name: 'ถัดไป' })); expect(onPress).toHaveBeenCalledTimes(1);
  render(<Button title="ส่ง" loading onPress={onPress2} />); fireEvent.press(screen.getByRole('button')); expect(onPress2).not.toHaveBeenCalled();
  render(<LoadGate status="error" retry={retry} skeleton={<Text>sk</Text>}><Text>body</Text></LoadGate>);
  expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeTruthy(); fireEvent.press(screen.getByText('ลองอีกครั้ง')); expect(retry).toHaveBeenCalled();
  render(<LoadGate status="loading" retry={retry} skeleton={<Text>sk</Text>}><Text>body</Text></LoadGate>); expect(screen.getByText('sk')).toBeTruthy();
  render(<Segmented options={[{ value: 'a', label: 'ก' }, { value: 'b', label: 'ข' }]} value="a" onChange={onChange} />);
  fireEvent.press(screen.getByText('ข')); expect(onChange).toHaveBeenCalledWith('b');
  ```
  Wrap each render in a test helper `renderWithTheme` (ThemeProvider with a non-persisted store).
- [ ] **Step 2:** Run `npx jest src/components/ui`. Expected: FAIL.
- [ ] **Step 3: Implement the kit** and `app/dev/kit.tsx`.
- [ ] **Step 4:** Run the tests and typecheck. Expected: PASS.
- [ ] **Step 5:** Run the Visual Check for `/dev/kit`. This is the only VC before the auth guard exists, so no PIN is needed. Confirm Thai strings wrap without clipping in both themes.
- [ ] **Step 6:** Commit with `feat(ui): token-driven component kit and dev gallery`.

### Task 12: Navigation shell and tab bar

**Files:**
- Modify: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/attendance.tsx`, `app/(tabs)/qr.tsx`, `app/(tabs)/wallet.tsx`, `app/(tabs)/me.tsx`, `app/qr.tsx`, `app/pin.tsx` (temporary), `app/+not-found.tsx`, `src/components/ui/TabBar.tsx`
- Delete: `app/index.tsx`

**Interfaces:**
- Consumes: `useApp` (`unlocked`, `unlock`), the Task 11 kit, and `haptic`.
- Produces:
  - The root `Stack` wraps routes in `<Stack.Protected guard={!unlocked}>` (`pin`, `forgot-pin`) and `<Stack.Protected guard={unlocked}>` (everything else).
  - Each later task adds one `<Stack.Screen name=… options=…/>` line inside the unlocked group. Presentations:
    - `modal`: `qr`, `topup`, `leave/new`, `assessments/[id]`
    - `formSheet` with `sheetAllowedDetents`: `forgot-pin [0.62]`, `day/[date] [0.45]`, `announcement/[id] [0.6]`
    - default push for everything else
  - `ToastHost` is mounted once, after the Stack.

**Tab bar decisions:**
- Tabs in order: `index` 'หน้าหลัก' `House`, `attendance` 'เวลาเรียน' `CalendarCheck`, `qr` (center), `wallet` 'กระเป๋า' `Wallet`, `me` 'ฉัน' `UserRound`.
- `TabBar` is passed as the `tabBar` prop:
  - `BlurView` background at intensity 40, tinted by scheme, with a 1px top `c.hairline`.
  - Labels use `caption` type. Active is `c.text` with a 2pt dot underneath, and inactive is `c.textSecondary`.
  - `haptic.selection()` on change.
  - The center item is a 60pt circle in `c.primary` with a `QrCode` icon in `c.onPrimary`, raised 18pt above the bar. Pressing it calls `router.push('/qr')` and never focuses the stub tab.
  - The accessibility label for the center button is "จ่ายเงินด้วย QR".
- The temporary `app/pin.tsx` has a single button "เข้าสู่ระบบ" that calls `unlock()`. Task 13 replaces it.
- Tab screens render `ScreenHeader` with their Thai title only (replaced later). `app/qr.tsx` shows a placeholder with a close button.

- [ ] **Step 1: Implement the layouts, TabBar, stubs and not-found.** The not-found screen shows `EmptyState` "ไม่พบหน้านี้" with the action "กลับหน้าหลัก", which calls `router.replace('/')`.
- [ ] **Step 2:** Run typecheck and the web bundle check. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/pin`, `/`, `/attendance`, `/wallet` and `/me`.** Tapping each tab switches screens, the QR button opens the modal, and the blur bar overlays scrolling content.
- [ ] **Step 4:** Commit with `feat(nav): protected stack, tabs, custom blurred tab bar with raised QR`.

### Task 13: PIN login and forgot-PIN

**Files:**
- Create: `src/features/auth/PinScreen.tsx` (default export), `app/pin.tsx` (replaces the stub with `export { default } from '@/features/auth/PinScreen'`), `app/forgot-pin.tsx`, `src/features/auth/PinDots.tsx`, `src/features/auth/PinPad.tsx`, `src/features/auth/useBiometric.ts`
- Test: `src/features/auth/__tests__/PinScreen.test.tsx`

**Interfaces:**
- Consumes: `checkPin`, `lockRemainingMs`, `PIN_LENGTH`, `INITIAL_GATE` (Task 3); `getPin` (Task 8); store `pinGate`, `setPinGate`, `unlock`, `settings.faceId`, `student`; `BorderTrace`, `useShake` (Task 10); `haptic`; `toast`.
- Produces:
  - `PinDots({ length, filled, state: 'idle' | 'error' | 'success' })`: 16pt dots with a 20pt gap. Each fill scale-pops (0.6→1, `dur.fast`). Error dots turn `c.danger`. On success the dots cross-fade into a single `Check` icon.
  - `PinPad({ onDigit(d: string), onDelete(), onBiometric?: () => void, disabled? })`: a 3×4 grid of 72pt round keys in `data` 28. The bottom-left key is Face ID (`ScanFace` icon, accessibility label "ใช้ Face ID") and is only rendered when `onBiometric` is set. The bottom-right key is delete (`Delete` icon, label "ลบ"). Each digit fires `haptic.selection()`.
  - `useBiometric(): { available: boolean; authenticate(): Promise<boolean> }`. It's available only when `isNative && settings.faceId && hasHardwareAsync && isEnrolledAsync`, and prompts with `promptMessage: 'เข้าสู่ระบบ Dschool'`.
  - `PinDots` and `PinPad` are reused by Task 25.

**Screen composition (spec §5.1):**
- Wordmark "Dschool" in `display` plus "ยินดีต้อนรับกลับ" and the italic nickname, fading in over `dur.slow`/`ease.slow`.
- Then the dots, a status caption line, the keypad, and a "ลืม PIN?" ghost button (→ `/forgot-pin`).
- **Six digits entered:**
  - **Correct:** `haptic.success()`, `BorderTrace mode="once"` around the dots row, then `unlock()` in `onDone`.
  - **Wrong:** `shake()`, `haptic.error()`, the caption "PIN ไม่ถูกต้อง · เหลืออีก {remaining} ครั้ง", and the dots clear after 400ms.
  - **Locked:** the caption "ลองใหม่ได้ในอีก {s} วินาที" ticks every second, and the keypad is disabled.
- **Face ID:** auto-prompts once on mount when available. Success follows the same success path.
- **`forgot-pin`:**
  - Title "ลืม PIN?"
  - Three numbered steps: "ติดต่อครูที่ปรึกษาหรือฝ่ายทะเบียน", "แจ้งรหัสนักเรียนและหมายเลขอุปกรณ์", "รับ PIN ใหม่แล้วเข้าสู่ระบบ"
  - An advisor `ListRow` with a phone action (`Linking.openURL('tel:…')`)
  - The device ID in `data` with a copy button that shows the toast "คัดลอกแล้ว"

- [ ] **Step 1: Write the failing test** (fake timers, reduced motion mocked on, `getPin` mocked to resolve '123456'; in `beforeEach` run `appStore.getState().resetDemo(T)` and `appStore.setState({ unlocked: false, pinGate: INITIAL_GATE })`; `store` below is `appStore`; render with `renderWithTheme`):
  ```ts
  render(<PinScreen />);
  for (const d of ['0','0','0','0','0','0']) fireEvent.press(screen.getByLabelText(d));
  expect(await screen.findByText('PIN ไม่ถูกต้อง · เหลืออีก 4 ครั้ง')).toBeTruthy();
  act(() => jest.advanceTimersByTime(400));
  for (const d of ['1','2','3','4','5','6']) fireEvent.press(screen.getByLabelText(d));
  await act(async () => { jest.advanceTimersByTime(300); });
  expect(store.getState().unlocked).toBe(true);
  ```
- [ ] **Step 2:** Run `npx jest src/features/auth`. Expected: FAIL.
- [ ] **Step 3: Implement** the components, the screen and the forgot-pin sheet. Add `<Stack.Screen name="forgot-pin" …/>` inside the locked group.
- [ ] **Step 4:** Run the tests and typecheck. Expected: PASS.
- [ ] **Step 5:** Run the Visual Check for `/pin` (wrong PIN once, then `123456`) and `/forgot-pin`.
- [ ] **Step 6:** Commit with `feat(auth): PIN login with shake, lockout, border-trace success, Face ID, forgot-PIN sheet`.

---

## Phase 2 — Home and Wallet

### Task 14: Home screen

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Create in `src/features/home/`: `HomeHeader.tsx`, `TodayCard.tsx`, `BalanceCard.tsx`, `FeatureTiles.tsx`, `WeekStrip.tsx`, `AnnouncementBand.tsx`, `HomeSkeleton.tsx`

**Interfaces:**
- Consumes:
  - selectors `todayInfo`, `semesterDays`, `spentToday`, `behaviorScore`, `pendingLeaves`, `dueAssessments`, `unreadCount`
  - `onTimeStreak`, `weekStrip`, `currentSemesterId`
  - `greetingFor`, `thaiDate`, `formatBaht`
  - the kit and motion components
- Produces `BalanceCard({ size = 'md' | 'lg', showActions = true })`, which Wallet and QR reuse:
  - `c.card` with `radius.tile`, and `PrismShimmer`
  - eyebrow "ยอดเงินคงเหลือ", balance as a `NumberTicker` in `data` 40
  - "ใช้ไปวันนี้ {formatBaht}"
  - when frozen, a `Lock` row "บัตรถูกอายัด"
  - actions: "เติมเงิน" primary (→ `/topup`) and "จ่าย QR" secondary (→ `/qr`)

**Composition (spec §5.2), top to bottom:**
1. `HomeHeader`: `thaiDate(now,'weekdayShort')` as eyebrow, `greetingFor` title with the italic nickname, and a `Bell` button with a count badge (→ `/notifications`).
2. `TodayCard`, variants by `todayInfo.kind`, each with a status-colored pill:
   - arrived: "ถึงโรงเรียน 07:32 · ตรงเวลา"
   - notYet: "ยังไม่ลงเวลา · ประตูปิด 08:00"
   - onLeave: "วันนี้ลาป่วย" or "วันนี้ลากิจ"
   - noSchool: "วันนี้ไม่มีเรียน"
3. `BalanceCard`.
4. `FeatureTiles`, a 2×2 grid:
   - attendance: value `{streak} วัน`, caption "ตรงเวลาติดต่อกัน" → `/attendance`
   - behavior: value `{score}`, caption "คะแนนพฤติกรรม" → `/behavior`
   - leave: value `{n}`, caption "รออนุมัติ" when n>0, otherwise label "ยื่นใบลา" → `/leave/new`
   - assessments: value `{n}`, caption "แบบประเมินที่ต้องทำ", or label "ทำครบแล้ว" when 0 → `/assessments`
5. `WeekStrip`: Monday–Friday dots in status colors, today outlined.
6. `AnnouncementBand`: `feature.announcements` fill, the 3 latest announcements (→ `/announcement/[id]`), and a "ดูทั้งหมด" link (→ `/notifications`).

**Behavior:**
- Wrap everything in `LoadGate` with `useResource('home')` and `HomeSkeleton`.
- Pull-to-refresh calls `refresh`.
- Sections use `StaggerIn` with index order.

- [ ] **Step 1: Implement** the components and the screen.
- [ ] **Step 2:** Run typecheck and the web bundle check. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/`.**
  - Repeat with `__app.getState().updateDemo({arrival:'notYet'})`, then `'onLeave'`, then `{networkErrors:true}` plus a pull-to-refresh (the ErrorState should show), then reset.
  - Also check `__app.getState().setFrozen(true)`.
- [ ] **Step 4:** Commit with `feat(home): today card, prism balance card, feature tiles, week strip, announcements`.

### Task 15: Wallet tab, history, freeze

**Files:**
- Modify: `app/(tabs)/wallet.tsx`
- Create: `app/wallet-history.tsx`, `src/features/wallet/WalletActions.tsx`, `src/features/wallet/SpendChart.tsx`, `src/features/wallet/TxList.tsx`

**Interfaces:**
- Consumes: `BalanceCard` (Task 14), `spendByDay`, `groupByDay`, store `setFrozen`, `ConfirmSheet`, `toast`.
- Produces:
  - `TxList({ transactions: Transaction[]; limit?: number })`:
    - Day headers read "วันนี้", "เมื่อวาน" or `thaiDate short`.
    - Rows: a top-up shows an `ArrowDownLeft` icon in `c.success` plus a "สลิป" chip. A purchase shows a `Utensils` icon with the title.
    - Time in `data` 13, and the signed amount via `formatBaht(…,{sign:true})` (`c.success` for top-ups).
  - `SpendChart({ data: { date: string; total: number }[] })`:
    - 7 SVG bars, `feature.wallet.fill`, with 45% opacity on every bar except today's.
    - Weekday labels come from `THAI_WEEKDAY_SHORT`, and the value label sits on today's bar.
    - Heights animate in with a 40ms stagger.

**Composition (spec §5.3):**
- `ScreenHeader` title "กระเป๋าเงิน".
- `BalanceCard size="lg" showActions={false}`.
- `WalletActions`: four 64pt circular buttons with labels.
  - "เติมเงิน" → `/topup`
  - "จ่าย QR" → `/qr`
  - "อายัดบัตร" or "ยกเลิกอายัด" → `ConfirmSheet`
  - "ตรวจสอบสลิป" → `/slip-check`
- `SpendChart` titled "ใช้จ่าย 7 วันล่าสุด".
- `TxList limit={10}`, then a "ดูทั้งหมด" link → `/wallet-history`.

**Freeze copy:**
- **Freeze sheet:** title "อายัดบัตร?", body "ระหว่างอายัด จะจ่ายเงินด้วย QR หรือบัตรไม่ได้ ยอดเงินยังอยู่ครบ ยกเลิกอายัดได้ทุกเมื่อ", confirm "อายัดบัตร" (destructive). Toast "อายัดบัตรแล้ว".
- **Unfreeze sheet:** title "ยกเลิกอายัดบัตร?", confirm "ยกเลิกอายัด". Toast "ยกเลิกอายัดแล้ว".

**`wallet-history`:**
- `ScreenHeader back` titled "ประวัติการใช้เงิน".
- `Segmented`: ทั้งหมด / เติมเงิน / ใช้จ่าย, over a full `TxList`.
- An empty filter shows `EmptyState` "ยังไม่มีรายการ".

**Loading:** `LoadGate` uses `useResource('wallet')`.

- [ ] **Step 1: Implement.** Add `<Stack.Screen name="wallet-history"/>`.
- [ ] **Step 2:** Run typecheck and the web bundle check. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/wallet` and `/wallet-history`.** Try each filter, then freeze and unfreeze, and confirm the Home banner reflects the frozen state.
- [ ] **Step 4:** Commit with `feat(wallet): balance, actions, 7-day chart, grouped history, freeze card`.

### Task 16: Top-up flow

**Files:**
- Create: `app/topup.tsx`, and in `src/features/topup/`: `AmountStep.tsx`, `TransferStep.tsx`, `SlipStep.tsx`, `SlipThumb.tsx`, `ScanningSlip.tsx`, `TopupResult.tsx`

**Interfaces:**
- Consumes: `topupReducer`, `initialTopup`, `stepIndex`, `validateAmount`, `TOPUP_PRESETS` (Task 5); `SCHOOL_ACCOUNT` (Task 7); store `submitSlip`, `wallet.balance`; `newId`; `now`; `ProgressSteps`, `BorderTrace`, `NumberTicker`, `haptic`, `toast`; expo-image-picker; expo-clipboard.
- Produces `SlipThumb({ uri })`. It renders the picked image, or, for `demo://slip`, a drawn sample slip built from Views: bank name, a mono amount, the recipient "โรงเรียนตัวอย่างวิทยา", and a date/time.

**Behavior (spec §5.3):**
- Hold one reducer instance and `clientId = useRef(newId('tp'))`.
- **Header:** a close `X` (`router.back()`), a back chevron on steps 2–3 (dispatches `BACK`), and `ProgressSteps(['จำนวนเงิน','โอนเงิน','ส่งสลิป'], stepIndex)`.
- **Transitions:** steps slide horizontally, forward from the right and `BACK` from the left, over `dur.base`/`ease.base`.
- **`AmountStep`:**
  - Preset `Chip`s plus a "จำนวนอื่น" chip that reveals a numeric `TextInput` (`keyboardType="number-pad"`).
  - Inline `validateAmount` errors in `c.danger` `caption`.
  - Primary button "ถัดไป · {formatBaht(amount)}".
- **`TransferStep`:**
  - The account card (bank, number in `data` 24, name) with a "คัดลอกเลขบัญชี" secondary button, which copies the number without dashes and shows the toast "คัดลอกเลขบัญชีแล้ว".
  - Notes in `c.danger` caption: "ยังไม่รองรับ TrueMoney และ ShopeePay" and "ห้ามโอนผ่านพร้อมเพย์ด้วยเลขบัญชีนี้".
  - Primary "โอนแล้ว · อัปโหลดสลิป".
- **`SlipStep`:**
  - Primary "เลือกรูปสลิป" launches the image library (`mediaTypes: ['images']`, `quality: 0.6`); cancelling stays on the step.
  - A ghost link "ใช้สลิปตัวอย่าง (เดโม)" dispatches `SLIP_PICKED` with `'demo://slip'`.
- **`ScanningSlip`:**
  - `SlipThumb` with a 2pt `feature.wallet.fill` line sweeping top→bottom 3 times over 2400ms total (static under reduced motion).
  - Caption "กำลังตรวจสอบสลิป…".
  - When it finishes: `result = submitSlip({ clientId, amount, nowMs: now().getTime() })`, then dispatch `SCAN_DONE`.
  - **Network failure** (spec §6): if `settings.demo.networkErrors` is on when the scan finishes, don't call `submitSlip`. Instead show `toast('ทำรายการไม่สำเร็จ ลองอีกครั้ง', { kind: 'error' })` and dispatch `RETRY`.
- **`TopupResult`:**
  - **verified:** a 96pt `Check` circle with `BorderTrace once`, "เติมเงินสำเร็จ", a `NumberTicker` from the old balance to the new one, `haptic.success()`, and primary "กลับไปที่กระเป๋า" (`router.back()`).
  - **pending:** "กำลังตรวจสอบสลิป เราจะแจ้งเตือนเมื่อเสร็จ" and a primary "ปิด".
  - **rejected:** "ตรวจสอบสลิปไม่ผ่าน", reason "ไม่พบรายการโอนที่ตรงกับสลิป", primary "ลองอีกครั้ง" (dispatches `RETRY`), and `haptic.error()`.

- [ ] **Step 1: Implement.** Add `<Stack.Screen name="topup" options={{ presentation: 'modal' }}/>`.
- [ ] **Step 2:** Run typecheck and the web bundle check. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/topup`, using the demo slip:**
  - `slipMode` `auto`: verified, and the balance goes up by the amount.
  - `pending`: wait 20s; the alert toast appears and the balance is credited.
  - `reject`: the retry path works.
  - A custom amount of "๑๐๐" is accepted.
- [ ] **Step 4:** Commit with `feat(topup): guided 3-step top-up with slip scan and verified/pending/rejected outcomes`.

### Task 17: Slip check

**Files:**
- Create: `app/slip-check.tsx`, `src/features/wallet/TransferCard.tsx`

**Interfaces:**
- Consumes: store `wallet.transfers` and `claimTransfer`; `formatBaht`, `thaiDate`, `timeHM`; `toast`; `haptic`.
- Produces: `TransferCard({ transfer: BankTransfer; onCheck(): void; checking: boolean })`.

**Behavior:**
- `ScreenHeader back` titled "ตรวจสอบการเติมเงิน".
- Helper captions:
  - "เลือกรายการโอนที่ตรงกับสลิปของคุณ แล้วกดตรวจสอบ"
  - "ไม่พบรายการ? ลองเลือกรายการในเวลาใกล้เคียง หรือรอ 3–5 นาทีแล้วรีเฟรช"
- Each card shows "วัน-เวลา" with the date and time in `data`, and "ยอดเงิน" with the amount in `data`.
- The "ตรวจสอบ" secondary button shows a `loading` state for 1200ms, then calls `claimTransfer`. On success: the card cross-fades to a `c.success` "เติมแล้ว ✓" row, the toast "เติมเงิน {amount} แล้ว" appears, and `haptic.success()` fires.
- Claimed transfers render the "เติมแล้ว" row without a button.
- Pull-to-refresh via `useResource('transfers')`.
- Empty: `EmptyState` "ไม่มีรายการโอนใน 7 วันที่ผ่านมา".

- [ ] **Step 1: Implement** and add the Stack.Screen.
- [ ] **Step 2:** Run typecheck. Expected: pass.
- [ ] **Step 3:** Run the Visual Check for `/slip-check`: claim one transfer, and confirm the balance in `/wallet` went up.
- [ ] **Step 4:** Commit with `feat(wallet): slip check list with one-time claims`.

### Task 18: QR pay and scan

**Files:**
- Modify: `app/qr.tsx`
- Create: `src/features/qr/PayQR.tsx`, `src/features/qr/ScanQR.tsx`, `src/lib/brightness.ts`

**Interfaces:**
- Consumes: `newQrToken`, `secondsLeft`, `QR_PERIOD_S` (Task 3); `BorderTrace countdown`; store `wallet`, `purchase`, `setFrozen`, `student.id`; `ConfirmSheet`; `haptic`; `toast`; expo-camera `CameraView`/`useCameraPermissions`; expo-blur.
- Produces: `useMaxBrightness(active: boolean): void`. It's native only: it saves the current brightness, sets it to 1 while `active`, and restores it on inactive or unmount.

**Behavior (spec §5.4):**
- The modal has a top row with a close `X` and a centered `Segmented` จ่ายเงิน / สแกน.
- **`PayQR`:**
  - Card title "แสดง QR นี้ที่ร้านค้า".
  - `QRCode` size 220 (color `c.text`, background `c.card`) inside a 260 frame with `BorderTrace mode="countdown" durationMs={60000} cycleKey={token}` in `c.primary`.
  - A caption that updates every second: "รหัสจะเปลี่ยนในอีก {s} วินาที". At 0 the token regenerates and the QR cross-fades.
  - The balance row sits below.
  - `useMaxBrightness(isFocused && tab==='pay')`.
  - **Frozen:** a `BlurView` over the QR with a `Lock` icon, "บัตรถูกอายัด", and a primary "ยกเลิกอายัด" that opens the unfreeze `ConfirmSheet` (Task 15 copy).
  - **Long-press on the QR (800ms):** `purchase({ amount: 35, title: 'ร้านข้าวมันไก่ป้าน้อย', nowMs })`.
    - ok: an overlay with a `Check` and `BorderTrace once`, "จ่ายเงินสำเร็จ", "−฿35 · ร้านข้าวมันไก่ป้าน้อย", the new balance, and `haptic.success()`; it auto-hides after 1800ms.
    - insufficient: `haptic.error()` and the toast "ยอดเงินไม่พอ".
- **`ScanQR`:**
  - **Web:** `EmptyState` "ใช้กล้องได้บนมือถือ".
  - **Permission not granted:** `EmptyState` "อนุญาตให้ใช้กล้องเพื่อสแกน QR" with the action "อนุญาต".
  - **Otherwise:** a `CameraView` (`barcodeScannerSettings={{ barcodeTypes: ['qr'] }}`) with a 240pt rounded viewfinder and a looping corner `BorderTrace` (static under reduced motion).
  - The first scan fires `haptic.success()`, pauses scanning, and shows a card "ข้อมูลใน QR" with the raw value in `data`, a secondary "สแกนอีกครั้ง" and a primary "เสร็จ".

- [ ] **Step 1: Implement.**
- [ ] **Step 2:** Run typecheck and the web bundle check. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/qr`.** Check the countdown ticking, a long-press purchase, the frozen state, and the scan tab's web fallback.
- [ ] **Step 4:** Commit with `feat(qr): rotating pay QR with countdown trace, brightness, demo purchase, scanner`.

---

## Phase 3 — Attendance and Leave

### Task 19: Attendance tab and day sheet

**Files:**
- Modify: `app/(tabs)/attendance.tsx`
- Create: `app/day/[date].tsx`, and in `src/features/attendance/`: `AttendanceRing.tsx`, `StatusRows.tsx`, `MonthCalendar.tsx`, `StreakChip.tsx`

**Interfaces:**
- Consumes: `semesterDays`, `semesterStarted`, `currentSemesterId`, `SEMESTERS`, `HOLIDAYS`, `countStatuses`, `attendanceRate`, `onTimeStreak`, `monthGrid`, `semesterMonths`, `STATUS_ORDER`, `STATUS_LABEL`, `statusColor`, `thaiMonthLong`, `thaiDate`, `NumberTicker`.
- Produces: `MonthCalendar({ months: { year: number; month0: number }[]; initialIndex: number; renderDay(date: string): { dot?: string; muted?: boolean; today?: boolean; disabled?: boolean; selected?: boolean }; onDayPress(date: string): void })`. Task 20's date picker reuses it.

**Composition (spec §5.5):**
- `ScreenHeader` title "เวลาเรียน", then `Segmented` "ภาคเรียน 1" / "ภาคเรียน 2" (default `currentSemesterId(today)`).
- **Semester not started:** `EmptyState` (attendance) "ภาคเรียนที่ 2 ยังไม่เริ่ม" with body "เริ่ม 1 พ.ย. 2569".
- **`AttendanceRing`:**
  - 200pt SVG with a 14pt stroke. Segments follow `STATUS_ORDER`, colored by `statusColor`, and sweep in with `ease.base`.
  - The center shows `{rate}%` as a `NumberTicker` in `data` 40, with the caption "มาเรียน".
- **`StreakChip`:** "มาตรงเวลาติดต่อกัน {n} วัน".
- **`StatusRows`:** 6 rows, each with a dot, the label, "{count} วัน" in `data`, and a 4pt bar whose width is proportional to the largest count.
- **`MonthCalendar`:**
  - Header: `thaiMonthLong` plus the BE year, with prev/next chevrons disabled at the ends. Horizontal pan left/right also changes the month.
  - Weekday header row: จ อ พ พฤ ศ ส อา.
  - 40pt cells. Weekends and holidays render muted. Today gets a 1.5pt `c.text` ring.
  - Days with a record show a dot and push `/day/[date]`.
- **`day/[date]`** sheet shows `thaiDate long`, a status pill, "เวลาเข้า {checkIn ?? '—'}", "ประตู {gate ?? '—'}", and the note when present.
- **Loading:** `LoadGate` uses `useResource('attendance')`.

- [ ] **Step 1: Implement** and add `<Stack.Screen name="day/[date]" …formSheet/>`.
- [ ] **Step 2:** Run typecheck and the web bundle check. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/attendance`.** Check semester 1 and 2, changing months, and tapping a day to open `/day/2026-09-28`.
- [ ] **Step 4:** Commit with `feat(attendance): ring, status rows, streak, month calendar, day sheet`.

### Task 20: Leave requests

**Files:**
- Create: `app/leave/new.tsx`, `app/leave/[id].tsx`, and in `src/features/leave/`: `LeaveSection.tsx`, `LeaveBadge.tsx`, `DateRangePicker.tsx`, `LeaveTimeline.tsx`
- Modify: `app/(tabs)/attendance.tsx` (render `LeaveSection` under the calendar)

**Interfaces:**
- Consumes: `validateLeave`, `schoolDaysBetween`, `LEAVE_STEPS`, `LEAVE_STEP_LABEL` (Task 6); store `submitLeave`, `leaves`; `MonthCalendar` (Task 19); `newId`; expo-image-picker; `BorderTrace`; `haptic`.
- Produces:
  - `LeaveBadge({ status })`:
    - submitted: "รออนุมัติ", `statusColor.late`
    - approved or recorded: "อนุมัติแล้ว", `statusColor.present`
    - rejected: "ไม่อนุมัติ", `statusColor.absent`
    - Each badge uses the status color at 15% as background, with the text in the status color.
  - `DateRangePicker({ semester: Semester; start: string | null; end: string | null; onChange(start: string | null, end: string | null) })`:
    - Built on `MonthCalendar`, starting from the month containing today.
    - Non-school days are disabled.
    - The first tap sets the start. The second tap sets the end, or restarts the range if it's before the start.
    - Shows "รวม {n} วันเรียน".

**Behavior (spec §5.5):**
- **`LeaveSection`:**
  - Heading "ใบลา" with a primary "ยื่นใบลา" (→ `/leave/new`). This is the attendance tab's single primary button.
  - Rows for the selected semester: type label, date range, "{n} วันเรียน", and a `LeaveBadge` (→ `/leave/[id]`).
  - Empty: `EmptyState` (leave) "ยังไม่มีใบลาในภาคเรียนนี้" with the action "ยื่นใบลา".
- **`leave/new`** (modal):
  - Title "ยื่นใบลา".
  - Type as two `Chip`s, "ลาป่วย" and "ลากิจ", with neither preselected.
  - `DateRangePicker`.
  - A multiline reason field with the placeholder "เช่น มีไข้ ไปพบแพทย์" and a counter "{n}/300".
  - An optional photo row "แนบรูป (ไม่บังคับ)" with a thumbnail and a remove button.
  - Primary "ส่งใบลา". Errors show inline under each field from `validateLeave`.
  - On success: `submitLeave` with `clientId` from `useRef(newId('lvc'))`, a 900ms `BorderTrace once` check overlay, `haptic.success()`, then `router.replace('/leave/{id}')`.
  - **Network failure:** if `settings.demo.networkErrors` is on, don't submit. Show `toast('ทำรายการไม่สำเร็จ ลองอีกครั้ง', { kind: 'error' })` and keep the form's contents.
- **`leave/[id]`:**
  - `ScreenHeader back` titled "สถานะใบลา".
  - `LeaveTimeline`: a vertical rail. Done steps get a filled `c.success` dot and `timeHM · thaiDate short`. The current step gets a pulsing dot (opacity loop, static under reduced motion). Future steps are hollow. Labels come from `LEAVE_STEP_LABEL`.
  - When the store advances the status while the screen is open, the new dot fills with `ease.base` and fires `haptic.light()`.
  - A details `Card` shows type, dates, school-day count, reason and the photo.

- [ ] **Step 1: Implement** and add the Stack.Screens (`leave/new` as a modal).
- [ ] **Step 2:** Run typecheck and the web bundle check. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/leave/new`.**
  - Submitting an empty form shows all three errors.
  - A valid submit routes to `/leave/<id>`.
  - With `fastLeave` on, the timeline reaches "บันทึกในระบบแล้ว" within about 10s.
  - The calendar shows the leave days in the sick color.
- [ ] **Step 4:** Commit with `feat(leave): request form with range picker, status timeline, attendance integration`.

---

## Phase 4 — Me, Behavior, Assessments, Alerts, Settings

### Task 21: Me tab, student card, profile

**Files:**
- Modify: `app/(tabs)/me.tsx`
- Create: `app/profile.tsx`, and in `src/features/me/`: `StudentCard.tsx`, `MonogramAvatar.tsx`

**Interfaces:**
- Consumes: `student`, `behaviorScore`, `dueAssessments`, `PrismShimmer`, `useTilt`, `haptic`, `ListRow`, expo-clipboard, `Linking`.
- Produces: `MonogramAvatar({ name: string; size: number })`, a circle in `feature.leave.fill` showing the first Thai consonant of `name` in Trirong.

**Behavior (spec §5.6 and §5.10):**
- **`StudentCard`:**
  - Width = screen − 40, aspect ratio 3:2, `radius.tile`, background `c.idCardBg`, text `c.idCardText`, with `PrismShimmer`.
  - Front: `MonogramAvatar` 64, full name in `heading`, "ม.5/3", "รหัส 24815" in `data`, and the school in `caption`.
  - Tap flips it: rotateY 0↔180° with perspective 1000, `dur.base`/`ease.base`, `backfaceVisibility: 'hidden'` on both faces, `haptic.light()`, and the accessibility hint "แตะเพื่อพลิกบัตร".
  - Back: `QRCode` of `STUDENT:24815` (size 120, white), "ปีการศึกษา 2569", and "หากพบบัตรนี้ กรุณาส่งคืนโรงเรียน".
- **Me rows:**
  - "พฤติกรรม" with value "{score} คะแนน" → `/behavior`
  - "แบบประเมิน" with value "ต้องทำ {n}" or "ครบแล้ว" → `/assessments`
  - "ข้อมูลส่วนตัว" → `/profile`
  - "ตั้งค่า" → `/settings`
- **`profile`:**
  - Rows: รหัสนักเรียน, ชั้น, เบอร์โทรนักเรียน, ผู้ปกครอง, เบอร์โทรผู้ปกครอง, ครูที่ปรึกษา.
  - Phones get a `Phone` action (`tel:`), and IDs get a copy action with the toast "คัดลอกแล้ว".
  - A null value renders "ยังไม่มีข้อมูล · ติดต่อฝ่ายทะเบียน" in `c.textSecondary`.

- [ ] **Step 1: Implement** and add the Stack.Screen for `profile`.
- [ ] **Step 2:** Run typecheck. Expected: pass.
- [ ] **Step 3:** Run the Visual Check for `/me` (flip the card both ways) and `/profile`.
- [ ] **Step 4:** Commit with `feat(me): flipping prism student card, profile with missing-value guidance`.

### Task 22: Behavior screen

**Files:**
- Create: `app/behavior.tsx`, and in `src/features/behavior/`: `ScoreGauge.tsx`, `BehaviorTimeline.tsx`

**Interfaces:**
- Consumes: `behavior`, `behaviorScore`, `NumberTicker`, `statusColor`, `thaiDate`.

**Behavior (spec §5.7):**
- `ScreenHeader back` titled "พฤติกรรม".
- **`ScoreGauge`:** a 240° SVG arc with a `c.hairline` track and a `feature.behavior.fill` progress that sweeps over `dur.base`. The center shows a `NumberTicker` in `display`, with the caption "จาก 100 คะแนน".
- **`BehaviorTimeline`:** newest first. Each row shows the signed delta in `data` (positive `c.success`, negative `c.danger`), the title, and `thaiDate short`.
  - Empty: `EmptyState` "ยังไม่มีการหัก/เพิ่มคะแนน · รักษาไว้นะ".
- **Tips `Card` "วิธีได้รับคะแนน":** "ช่วยงานจิตอาสาของโรงเรียน", "เป็นตัวแทนโรงเรียนร่วมกิจกรรม", "ช่วยเหลือเพื่อนและครู".
- **Loading:** `LoadGate` uses `useResource('behavior')`.

- [ ] **Step 1: Implement** and add the Stack.Screen.
- [ ] **Step 2:** Run typecheck. Expected: pass.
- [ ] **Step 3:** Run the Visual Check for `/behavior`.
- [ ] **Step 4:** Commit with `feat(behavior): score gauge, history timeline, tips`.

### Task 23: Assessments

**Files:**
- Create: `app/assessments/index.tsx`, `app/assessments/[id].tsx`, and in `src/features/assessments/`: `QuestionView.tsx`, `ResultView.tsx`

**Interfaces:**
- Consumes: `assessments`, `completeAssessment`, `scoreAssessment`, `Chip size="lg"`, `haptic`, `thaiDate`.

**Behavior (spec §5.8):**
- **List:** a `ScreenHeader back` titled "แบบประเมิน" and a card per assessment.
  - Each card shows the title, the description, "{n} ข้อ", and a status: "ยังไม่ทำ", or "ทำแล้ว · {thaiDate short}".
  - The action is "เริ่มทำ", or "ทำอีกครั้ง" when already done (→ `/assessments/[id]`).
- **Flow (modal):**
  - Close `X`, the label "ข้อ {i+1}/{n}", and a 4pt progress bar animating with `ease.base`.
  - `QuestionView`: the question in `heading`, then the options as full-width `Chip size="lg"`.
  - Selecting an option fires `haptic.selection()` and advances after 250ms, sliding left. A back chevron returns to the previous question and keeps its answer.
  - After the last answer: `completeAssessment(id, answers, nowMs)`, then `ResultView`.
- **`ResultView`:** per dimension, a label plus a bar (`feature.assessments.fill`) and "{score}/{max}".
  - Disclaimer in `caption`: "ผลนี้เป็นตัวอย่างเพื่อการสาธิต ผลจริงจะส่งให้ครูแนะแนวพิจารณา".
  - Primary "เสร็จสิ้น" (`router.back()`).

- [ ] **Step 1: Implement** and add the Stack.Screens (`assessments/[id]` as a modal).
- [ ] **Step 2:** Run typecheck. Expected: pass.
- [ ] **Step 3:** Run the Visual Check for `/assessments`. Complete EQ end to end, including going back once, and confirm the list shows "ทำแล้ว".
- [ ] **Step 4:** Commit with `feat(assessments): one-question-per-screen flow with results`.

### Task 24: Alerts inbox, announcement sheet, live alert toasts

**Files:**
- Create: `app/notifications.tsx`, `app/announcement/[id].tsx`, `src/features/notifications/AlertRow.tsx`, `src/features/notifications/AlertToaster.tsx`
- Modify: `app/_layout.tsx` (mount `<AlertToaster />` inside the unlocked tree)

**Interfaces:**
- Consumes: `alerts`, `announcements`, `markRead`, `markAllRead`, `relativeTime`, `FEATURE_ICON`, `feature`, `toast`, `ReanimatedSwipeable` from `react-native-gesture-handler/ReanimatedSwipeable`.
- Produces: `AlertToaster()`. It subscribes to the store, and when a new alert id appears at the head of `alerts` after mount and that alert is unread, it calls `toast(alert.title, { href: alert.link })`.

**Behavior (spec §5.9):**
- `ScreenHeader back` titled "การแจ้งเตือน", with the right-side action "อ่านทั้งหมด" as a ghost button.
- Sections "วันนี้" and "ก่อนหน้า", split by calendar day of `now()`.
- **`AlertRow`:** a 36pt chip in `feature[kindToFeature].fill` with its icon, the title in `label`, a 1-line body snippet, `relativeTime` in `caption`, and an unread dot in `c.primary`.
  - Swiping left reveals the "อ่านแล้ว" action, which calls `markRead`.
  - Tapping calls `markRead` and then `router.push(link)`.
- **Kind to feature:** topup → wallet, leave → leave, announcement → announcements, attendance → attendance, behavior → behavior.
- **Empty:** `EmptyState` "ไม่มีการแจ้งเตือน".
- **`announcement/[id]`** sheet: category eyebrow, `title` type, `thaiDate long`, and the body.

- [ ] **Step 1: Implement**, add the Stack.Screens, and mount `AlertToaster`.
- [ ] **Step 2:** Run typecheck. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/notifications`.** Swipe to mark read, and check that the bell badge updates. Submit a pending top-up and confirm the toast appears after 20s and tapping it opens `/wallet`. Open an announcement from Home.
- [ ] **Step 4:** Commit with `feat(alerts): inbox with swipe-to-read, deep links, announcement sheet, live toasts`.

### Task 25: Settings, change PIN, demo controls

**Files:**
- Create: `app/settings/index.tsx`, `app/settings/change-pin.tsx`

**Interfaces:**
- Consumes: `updateSettings`, `updateDemo`, `resetDemo`, `lock`; `getPin`, `setPin`, `DEMO_PIN`; `PinDots`, `PinPad`, `useShake` (Tasks 10 and 13); `Segmented`, `ListRow`, RN `Switch` (tinted `c.primary`); `ConfirmSheet`; `toast`.

**Behavior (spec §5.10):**
- **Sections:**
  - **การแสดงผล:** `Segmented` ตามระบบ / สว่าง / มืด for `settings.theme`.
  - **ความปลอดภัย:** a "เปลี่ยน PIN" row (→ `/settings/change-pin`) and a "เข้าสู่ระบบด้วย Face ID" Switch.
  - **การแจ้งเตือน:** Switches for เติมเงิน, ใบลา, ประกาศ, เวลาเรียน and พฤติกรรม.
  - **เกี่ยวกับ:** a version row "เวอร์ชัน 1.0.0 (เดโม)". Five taps within 3s set `demo.visible = true` and show the toast "เปิดโหมดเดโมแล้ว".
  - **โหมดเดโม** (only when `demo.visible`):
    - Switch "จำลองเครือข่ายล่ม" (`networkErrors`)
    - Segmented "ผลตรวจสลิป": อัตโนมัติ / รอตรวจ / ไม่ผ่าน (`slipMode`)
    - Switch "เร่งการอนุมัติใบลา" (`fastLeave`)
    - Segmented "สถานะวันนี้": มาแล้ว / ยังไม่มา / ลา (`arrival`)
    - Row "ชุดคอมโพเนนต์" → `/dev/kit`
    - Button "รีเซ็ตข้อมูลเดโม", which opens a `ConfirmSheet` and then calls `resetDemo(nowMs)` and `setPin(DEMO_PIN)` with the toast "รีเซ็ตแล้ว"
  - **Logout:** a destructive ghost "ออกจากระบบ" that opens a `ConfirmSheet` ("ออกจากระบบ?"), then calls `lock()`. The guard routes to `/pin`.
- **`change-pin`:**
  - Three stages, each titled with the stage name: "ใส่ PIN ปัจจุบัน" → "ตั้ง PIN ใหม่" → "ยืนยัน PIN ใหม่".
  - A wrong current PIN shakes with "PIN ไม่ถูกต้อง".
  - A confirmation mismatch shakes with "PIN ไม่ตรงกัน ลองอีกครั้ง" and returns to "ตั้ง PIN ใหม่".
  - Success: `setPin`, the toast "เปลี่ยน PIN แล้ว", then `router.back()`.

- [ ] **Step 1: Implement** and add the Stack.Screens. Link `/settings` from Me (Task 21 already routes there).
- [ ] **Step 2:** Run typecheck. Expected: pass.
- [ ] **Step 3: Run the Visual Check for `/settings`.**
  - Toggle the theme to dark and confirm the whole app changes.
  - Reveal the demo section with 5 taps.
  - Turn on network errors, confirm Home shows the ErrorState, then turn it off and retry.
  - Change the PIN to `654321`, log out, log in with the new PIN, then reset demo data and log in with `123456`.
- [ ] **Step 4:** Commit with `feat(settings): theme, PIN change, Face ID, notifications, hidden demo controls, logout`.

---

## Phase 5 — Polish and verification

### Task 26: Error boundary, audits, README, full walkthrough

**Files:**
- Modify: `app/_layout.tsx` (export `ErrorBoundary`)
- Create: `README.md`

- [ ] **Step 1: Add the error boundary.** Export `ErrorBoundary({ error, retry })` from `app/_layout.tsx`: a centered `Text` "มีบางอย่างผิดพลาด", the body "ลองเปิดหน้านี้ใหม่อีกครั้ง", and a primary "ลองใหม่" that calls `retry`.
- [ ] **Step 2: Run the constraint audits** (Git Bash). Each should print nothing:
  ```
  grep -rnE "#[0-9a-fA-F]{6}\b" app src --include=*.ts --include=*.tsx | grep -v "^src/theme/"
  grep -rnE "shadow(Color|Offset|Opacity|Radius)|elevation:" app src
  grep -rn "toLocaleDateString\|toLocaleString(" app src
  grep -rnE "new Date\(\)|Date\.now\(\)" app src | grep -v "src/lib/clock.ts"
  ```
  Fix every hit.
- [ ] **Step 3: Check the one-primary rule.**
  1. Run `grep -rn 'variant="primary"' app src/features`.
  2. For each file, confirm that at most one primary is visible at a time.
  3. `BalanceCard` actions count as Home's primary. On `/wallet` it renders with `showActions={false}`.
- [ ] **Step 4: Write `README.md`.**
  - What the prototype is: a pitch prototype that uses sample data.
  - **Run on iPhone:**
    1. Install **Expo Go** from the App Store.
    2. Run `npm install`, then `npx expo start`. Use `npx expo start --tunnel` if the phone and PC aren't on the same Wi-Fi.
    3. Scan the QR code with the iPhone Camera app.
  - The demo PIN is `123456`.
  - How to reveal demo controls: tap the version row 5 times in Settings.
  - The demo purchase: long-press your pay QR.
  - The demo slip: "ใช้สลิปตัวอย่าง (เดโม)".
  - **Face ID caveat** (spec §7), with the development-build command.
  - The web preview with `npm run web`.
  - Tests: `npm test`.
  - A folder map.
- [ ] **Step 5: Run the full checks.** Run `npm test -- --ci`, `npm run typecheck` and the web bundle check. Expected: all tests pass, typecheck exits 0, and the export succeeds.
- [ ] **Step 6: Do the full Visual Check walkthrough.** Visit every route in the file map, in light and dark:
  - `/pin`, `/forgot-pin`, `/`, `/notifications`, `/announcement/<id>`, `/attendance`, `/day/<date>`, `/leave/new`, `/leave/<id>`, `/qr`, `/topup`, `/wallet`, `/wallet-history`, `/slip-check`, `/me`, `/profile`, `/behavior`, `/assessments`, `/assessments/eq`, `/settings`, `/settings/change-pin`, `/dev/kit`
  - Then repeat `/`, `/wallet` and `/attendance` with `networkErrors` on, to confirm the ErrorState and retry work.
  - Record any defect, fix it, and re-check that route.
- [ ] **Step 7:** Commit with `chore: error boundary, constraint audits, README with iPhone run guide`.
