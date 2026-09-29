# Dschool AI

A Thai student-app pitch prototype built with Expo SDK 57, React Native, TypeScript, and Expo Router. It demonstrates attendance, leave requests, a school wallet, QR payment, assessments, notifications, and settings using sample data stored locally on the device.

Student details, bank details, wallet balances, purchases, slip checks, approvals, and assessment results are fictional. There is no live school backend, real payment processing, or push-notification service. Use the sample slip; no bank transfer is needed.

## Run on iPhone

Use Node.js 22.13 or newer and npm. SDK 57 requires iOS 16.4 or newer; see the [SDK 57 requirements](https://docs.expo.dev/versions/v57.0.0/).

1. Install **Expo Go** from the App Store.
2. In the project directory, run:

   ```sh
   npm install
   npx expo start
   ```

3. Keep the computer and iPhone on the same Wi-Fi network. Scan the terminal QR code with the iPhone Camera app and open it in Expo Go.
4. Unlock with the demo PIN **`123456`**.

If the devices cannot connect over the local network, start with `npx expo start --tunnel` instead. Install the tunnel helper if Expo prompts for it.

## Web preview and checks

```sh
npm run web
npm test
npm test -- --ci --runInBand
npm run typecheck
npx expo lint
npx expo export --platform web --output-dir .export-check
```

The web preview supports the app flows with fallbacks for device-only features. Check camera scanning, haptics, QR-screen brightness, and card motion on a physical device. The export command checks the production web bundle; it does not replace a visual walkthrough.

## Demo walkthrough

- **Home:** review today's arrival, balance, attendance streak, behavior, assessments, and school announcements.
- **Wallet:** choose **เติมเงิน**, enter an amount from 10 to 2,000 baht, continue through the sample transfer details, then select **ใช้สลิปตัวอย่าง (เดโม)**. Review the result and transaction history.
- **QR payment:** open **จ่าย QR** and hold the payment QR for about a second to simulate a 35-baht purchase. Freezing the card prevents purchases; unfreeze it from Wallet or the QR screen.
- **Attendance and leave:** inspect a day, submit a leave request with school days and a reason, and watch its simulated approval timeline. Pending top-ups and leave requests continue progressing while the app runs and overdue work is processed after reopening.
- **Me:** tilt or flip the pastel holographic Rajadamri student pass to reveal the student-ID QR. The anonymous illustrated avatar uses no real student photo. Tap **จ่าย QR**, **ทางลัด**, or **ข้อมูลฉัน** below the card to expand payment, attendance/leave, or profile actions. Inspect behavior, complete an assessment, and open **ตั้งค่า**.
- **Settings:** choose **ตามระบบ**, **สว่าง**, or **มืด** from live previews, or use the sun/moon button on Home; turn Face ID sign-in on or off; configure in-app alert categories; or log out. **ตามระบบ** follows the device appearance.

App data persists locally. A changed PIN replaces `123456` until it is changed again or reset from the demo controls. Five incorrect login attempts trigger a 30-second lockout.

## App identity and typography

The app uses a frosted-pastel glass look: translucent cards over soft ambient light, in muted lavender, sky, mint, rose, and apricot, with one deep ink for primary actions. **Settings → การแสดงผล** switches between light, dark, and the device setting. Status text and distinct attendance symbols preserve meaning without color. Brand assets and generation notes are in [`assets/brand/`](assets/brand/README.md). Native icon and splash changes require a new app build; Expo Go does not verify the final launcher appearance.

Thai headings and reading text use IBM Plex Sans Thai with room for stacked tone marks. IBM Plex Mono is reserved for numeric data and Latin labels. Reduced motion replaces the card flip and action-panel movement with opacity changes. New demo data uses Rajadamri as its school name; previously saved sample records are kept until a demo reset.

## Frosted pastel design system

Every color comes from `src/theme/tokens.ts`. The contrast tests in `src/theme/__tests__/theme.test.ts` check text against its worst background in both themes: glass over the brightest ambient light, and the frozen card's icy tint.

| Piece | Where | What it does |
| --- | --- | --- |
| Ambient light | `components/motion/AmbientLight.tsx`, `Aurora.tsx` | Four soft pastel light pools behind every screen. They drift slowly and parallax gently while scrolling, and stay still under Reduce Motion. |
| Glass | `components/ui/Glass.tsx` | A translucent fill, a glossy highlight at the top edge, a bright rim, and a soft tinted shadow. Blur is used only where content moves underneath: the tab bar, compact title bar, sheets, and toasts. It is available on iOS and web; Android uses a denser fill instead. iOS Reduce Transparency makes glass opaque. |
| Floating tab bar | `components/ui/TabBar.tsx` | A frosted capsule with a lens that springs under the active tab, and a glossy ink QR button. |
| Glass sheet | `components/ui/GlassSheet.tsx` | The background blurs and dims, and the sheet slides up. Drag it down or tap outside to close. `ConfirmSheet` and card details use it. |
| Rolling balance | `components/motion/RollingNumber.tsx` | Odometer digits roll into place. |
| Frozen card | `components/motion/FrostOverlay.tsx` | An icy tint, frosted edges, ice crystals, and falling snow while the card is frozen. |
| Bento tiles | `components/ui/Tile.tsx`, `motion/GlossOrb.tsx` | Each feature has a pastel scene with a floating glossy sphere. |
| Today's journey | `features/home/Journey.tsx` | A route from home to school, with a glowing dot for today's status. |
| Theme switch | `components/ui/ThemeToggle.tsx`, `motion/ThemeFade.tsx` | The sun sets as the moon rises, then the old background fades into the new theme. |

Wallet's eye button opens **รายละเอียดบัตร**. The student ID is masked until revealed and is masked again when the sheet closes. Each value has an in-place **คัดลอก** confirmation.

## Video-inspired interaction refresh

The refreshed Home, student pass, and wallet apply the reference videos' materials and motion to working student-app flows:

- **Campus search:** Home filters a local menu list using Thai and English keywords, such as `ใบลา`, `leave`, and `wallet`, and opens the selected screen. The microphone opens the separate voice-and-text command sheet described below.
- **Today's journey:** select a milestone to see the actual scan or arrival details; use **ดูเวลาเรียน** to open Attendance. The trail reflects the current arrived or waiting-to-scan state. Approved leave and non-school days show their own summaries.
- **Overview tiles:** attendance streak, behavior score, pending leave count, and assessments due come from the local demo records. The behavior ring represents the actual score in those records.
- **Student pass:** engraved contours and a silver reflection follow touch or mouse movement, with tilt limited to seven degrees per axis. Keyboard focus also highlights the card. Tap to flip; scrolling, dragging, and long presses do not flip it. The QR side stays level, and Reduce Motion disables tilt.
- **Wallet details:** tap **รายละเอียด** to lift the wallet card and open the sheet. Reveal or hide the student ID, copy the ID or cardholder name, and dismiss using the close button, backdrop, or downward drag on the handle. Copy success or failure is shown in the sheet; the ID starts masked each time it opens.
- **Spending history:** select a date in the seven-day chart to see that day's total and purchases. Select it again or choose **ทุกวัน** to return to recent transactions.
- **Card freeze:** confirming **อายัดบัตร** changes the persisted demo wallet state and blocks simulated purchases. Frost appears around the balance card's edges while frozen and clears when unfrozen; the balance is preserved. This controls the local demo wallet only.

`GlassSurface` adapts its material to the platform:

| Environment | Material |
| --- | --- |
| Supported iOS with native glass APIs available | Native liquid glass through `expo-glass-effect`. |
| iOS with Reduce Transparency enabled, or its preference unavailable | Opaque card fill. |
| Older iOS and web | Blur with a tinted fill and highlight. |
| Android | Tinted fallback, without backdrop blur. |

The SDK-compatible `expo-glass-effect` package is installed. Native liquid glass requires iOS 26 or later and runtime API availability; see the [SDK 57 GlassEffect documentation](https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect/). If using a custom development build created before this dependency was added, rebuild and reinstall that binary before testing it; restarting Metro alone does not add the native module.

Physical iOS and Android verification remains outstanding, including glass rendering, accessibility preferences, and touch/scroll behavior. Web and automated checks do not establish native-device parity.

## Voice commands and study timer

On Home, tap the microphone beside search. Speak in Thai or English, or type into the same command sheet. Examples include **เปิดบัตรนักเรียน**, **ดูกระเป๋าเงิน**, **ตั้งเวลา 25 นาที**, and **set a timer for 25 minutes**. The sheet shows the recognized command; tap it to open the selected screen or start a timer. Commands never submit a payment, leave request, or account change automatically. This is a finite local command set, with no AI backend.

Speech recognition uses the device or browser's recognition service and may need an internet connection. The microphone is requested only when starting speech input. On iOS and Android, `expo-speech-recognition` requires a custom development build containing its native module and configured permissions. **Expo Go supports typed commands only.** Browsers without speech-recognition support show a message and retain typed commands. Rebuild an existing development binary after adding this package; a Metro restart cannot add native code.

Timers accept whole minutes from 1 to 180. The Home timer card supports pause, resume, and clearing the timer; starting another active timer asks before replacing it. A saved deadline preserves elapsed time across navigation and reopening the app. Completion is shown in the app; no background alarm or system notification is scheduled.

## Reveal demo controls

In **ฉัน → ตั้งค่า**, tap **เวอร์ชัน 1.0.0 (เดโม)** five times within three seconds. The **โหมดเดโม** section contains:

| Control | What to try |
| --- | --- |
| จำลองเครือข่ายล่ม | Enable it, open or refresh Home, Wallet, or Attendance to see the error state. Disable it, return, and retry. |
| ผลตรวจสลิป | Choose automatic, pending, or rejected before submitting a sample slip. A pending top-up settles after about 20 seconds. |
| เร่งการอนุมัติใบลา | Enable before submitting a leave request to shorten approval to about five seconds and recording to a further three seconds. |
| สถานะวันนี้ | Simulate arrived, not yet arrived, or on leave. Weekends, holidays, and approved leave still follow the school calendar. |
| ชุดคอมโพเนนต์ | Open the component gallery for typography, controls, states, and motion. |
| รีเซ็ตข้อมูลเดโม | Confirm to restore the sample records and the PIN `123456`. The selected theme and visibility of the demo section are kept. |

## Face ID and development builds

Face ID on iOS is **not supported in Expo Go**. Use the PIN there and test actual Face ID in a development build on a compatible, enrolled device. This is the documented [SDK 57 LocalAuthentication limitation](https://docs.expo.dev/versions/v57.0.0/sdk/local-authentication/).

The repository is not yet linked to an EAS project and does not include `eas.json`. To prepare an iPhone development build in the cloud:

```sh
npx expo install expo-dev-client
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build:configure
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile development
```

Use your own iOS bundle identifier in `app.json`, an Expo account, and the Apple Developer membership required for an iPhone EAS build. Configure the `development` profile with `developmentClient: true` and `distribution: "internal"`; register the test iPhone when prompted. Install the resulting build, then run `npx expo start --dev-client` and open the project in it. Cloud builds work from Windows without a local Xcode installation. See the [EAS setup guide](https://docs.expo.dev/tutorial/eas/configure-development-build/) and [physical iPhone guide](https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/).

Native directories are generated by Expo. Configure permissions and native behavior through `app.json` and config plugins, and install additional packages through `npx expo install` to resolve compatible versions.

## Project map

```text
app/                         Expo Router screens, root layout, and tab navigation
  settings/                  Appearance, security, demo controls, and PIN change
  dev/kit.tsx                Component gallery
src/components/ui/           Shared UI controls and loading/error/empty states
src/components/motion/       Motion primitives and Reduce Motion support
src/components/RootErrorBoundary.tsx
                             Provider-independent startup recovery screen
src/features/               Components grouped by student-app feature
src/data/                   Sample records, persisted store, simulated API/events
src/lib/                    Pure domain logic, Thai formatting, platform helpers
src/theme/                  Colors, typography, spacing, and motion tokens
src/test/                   Shared test helpers; tests also live beside features
docs/superpowers/specs/     Product and design specification
docs/superpowers/plans/     Implementation and verification plan
```

All app copy is Thai. Dates use the Buddhist era through `src/lib/format.ts`; time reads go through `src/lib/clock.ts`. Routes stay in the root `app/` directory, and `@/` resolves to `src/`.
"# d" 
