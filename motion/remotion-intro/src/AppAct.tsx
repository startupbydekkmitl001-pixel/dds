import type { CSSProperties } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Ambient, CalendarCheck, ClipboardList, FileText, Grain, ShieldCheck } from './bits';
import { CARD_H, CARD_W, StudentCard } from './Card';
import { EASE_LEAVE, EASE_OUT, pulse, sp, tween } from './motion';
import { FEATURES, FONT, PALETTE, type FeatureKey, type ThemeName } from './theme';
import { Tile, TILE_H, TILE_W } from './Tile';

export type AppActProps = { theme: ThemeName };

/**
 * Act 2 of the welcome film, "the app". 60 fps, local frames. The HyperFrames master places this
 * clip from 4.4 s (frame 0 is the flat canvas its push-through ends on) and lays the finale headline
 * and seal over its last 4 s (from local frame 606), so the top of the frame is left clear then.
 */
export const APP_ACT_FRAMES = 846;
/** See the headline transforms: keeps settling text off Chrome's pixel-snapping path. */
const UNSNAP = 0.02;

// Each tour headline stays up about a second, long enough to read a line of Thai.
const T = {
  cardIn: 12,
  flipToBack: 100,
  flipToFront: 176,
  cardOut: 230,
  tilesIn: 248,
  tour: 336,
  step: 66,
} as const;

/** Grid of four tiles; its final resting place is the frame the finale is built on. */
const GRID = { left: 72, top: 760, gapX: 36, gapY: 40 };
const CARD = { left: (1080 - CARD_W) / 2, top: 850 };

type TileSpec = { key: FeatureKey; value?: (t: number) => string; label: string; caption: string; badge: string; headline: string };
const TILES: TileSpec[] = [
  { key: 'attendance', value: (t) => `${Math.round(14 * t)} วัน`, label: 'เวลาเรียน', caption: 'ตรงเวลาติดต่อกัน', badge: 'ตรงเวลา 14 วันติด', headline: 'มาเรียนตรงเวลา' },
  { key: 'behavior', value: (t) => `${Math.round(100 * t)}`, label: 'พฤติกรรม', caption: 'คะแนนพฤติกรรม', badge: 'คะแนนเต็ม 100', headline: 'ดูแลความประพฤติ' },
  { key: 'leave', label: 'ใบลา', caption: 'ยื่นใบลา', badge: 'อนุมัติแล้ว', headline: 'ส่งใบลาในไม่กี่แตะ' },
  { key: 'assessments', value: (t) => `${Math.round(2 * t)}`, label: 'แบบประเมิน', caption: 'แบบประเมินที่ต้องทำ', badge: 'รอทำ 2 ชุด', headline: 'แบบประเมินพร้อมทำ' },
];

const HEADLINES = [
  { eyebrow: 'DSCHOOL · STUDENT ID', text: 'บัตรนักเรียนในมือถือ', in: 40, out: T.cardOut },
  ...TILES.map((t, i) => ({ eyebrow: `0${i + 1} / 04`, text: t.headline, in: T.tour + i * T.step, out: T.tour + (i + 1) * T.step - 6 })),
];

export const AppAct = ({ theme }: AppActProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = PALETTE[theme];
  const feat = FEATURES[theme];

  // ── The card ───────────────────────────────────────────────────────────────
  const arrive = sp(frame, fps, T.cardIn, { damping: 16, stiffness: 80, mass: 1.05 });
  const flipSpring = { damping: 19, stiffness: 62, mass: 1.1 };
  const flip = 180 * (sp(frame, fps, T.flipToBack, flipSpring) - sp(frame, fps, T.flipToFront, flipSpring));
  const leave = tween(frame, T.cardOut, T.cardOut + 58, 0, 1, EASE_LEAVE);
  const leaveNext = tween(frame + 1, T.cardOut, T.cardOut + 58, 0, 1, EASE_LEAVE);
  const t = frame / fps;
  const idle = Math.min(1, Math.max(0, (frame - T.cardIn - 40) / 40));
  const tiltY = 6 * Math.sin(t * 2.3) * idle;
  const tiltX = 3 * Math.sin(t * 1.7 + 1) * idle;
  const cardStyle: CSSProperties = {
    position: 'absolute',
    left: CARD.left,
    top: CARD.top,
    width: CARD_W,
    height: CARD_H,
    transformStyle: 'preserve-3d',
    transform: [
      `translateY(${(1 - arrive) * 340 - leave * 1500}px)`,
      `scale(${(0.6 + 0.4 * arrive) * (1 - 0.3 * leave)})`,
      `rotateX(${(1 - arrive) * 44 + tiltX - leave * 22}deg)`,
      `rotateY(${flip + tiltY}deg)`,
    ].join(' '),
    boxShadow: `0 60px 140px ${c.shadowDeep}`,
    borderRadius: 64,
  };
  // Opacity and blur flatten a 3D context, so they live on the stage around the card, which also owns
  // the perspective (it only reaches direct children). On the card itself they hid the back face.
  const blur = Math.min(5, (leaveNext - leave) * 1500 * 0.09);
  const cardStage: CSSProperties = {
    position: 'absolute',
    inset: 0,
    perspective: 2200,
    perspectiveOrigin: '50% 1150px',
    opacity: tween(frame, T.cardIn, T.cardIn + 14, 0, 1) * (1 - tween(frame, T.cardOut + 34, T.cardOut + 56, 0, 1)),
    filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
  };
  // The sheen sweeps as the card lands and again as it comes back round.
  const sheen = frame < 150 ? tween(frame, 56, 112, 0, 1, EASE_OUT) : tween(frame, 198, 250, 0, 1, EASE_OUT);

  // ── The tiles ──────────────────────────────────────────────────────────────
  const spots = TILES.map((_, i) => pulse(frame, fps, T.tour + i * T.step, T.tour + (i + 1) * T.step - 4, { damping: 22, stiffness: 150 }));

  return (
    <AbsoluteFill style={{ fontFamily: FONT.ui }}>
      <Ambient theme={theme} frame={frame} bloom={tween(frame, 0, 54, 0, 1, EASE_OUT)} />

      {/* Headlines: one line at a time, rising through a mask. */}
      <div style={{ position: 'absolute', left: 80, top: 330, width: 940, height: 300 }}>
        {HEADLINES.map((h, i) => {
          const inn = sp(frame, fps, h.in, { damping: 20, stiffness: 110 });
          const out = tween(frame, h.out - 14, h.out, 0, 1, EASE_LEAVE);
          if (inn <= 0.001 || out >= 0.999) return null;
          return (
            <div key={i} style={{ position: 'absolute', inset: 0 }}>
              <div style={{ overflow: 'hidden', height: 48 }}>
                <div style={{ font: `500 30px/48px ${FONT.mono}`, letterSpacing: '0.18em', color: c.text2, transform: `translateY(${(1 - inn) * 110 - out * 110}%) rotate(${UNSNAP}deg)` }}>{h.eyebrow}</div>
              </div>
              <div style={{ overflow: 'hidden', height: 170, marginTop: 6 }}>
                <div style={{ paddingTop: 10, font: `300 108px/1.4 ${FONT.display}`, letterSpacing: '-0.01em', color: c.text, whiteSpace: 'nowrap', transform: `translateY(${(1 - inn) * 110 - out * 110}%) rotate(${UNSNAP}deg)` }}>
                  {h.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* The card, in its own 3D stage. */}
      {frame < T.cardOut + 60 ? (
        <div style={cardStage}>
          <div style={cardStyle}>
            <StudentCard theme={theme} flip={flip} sheen={sheen} />
          </div>
        </div>
      ) : null}

      {/* The Home grid. */}
      {frame >= T.tilesIn - 2 ? (
        <div style={{ position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: '50% 1200px' }}>
          {TILES.map((tile, i) => {
            const start = T.tilesIn + i * 7;
            const e = sp(frame, fps, start, { damping: 15, stiffness: 95, mass: 0.95 });
            const col = i % 2;
            const row = Math.floor(i / 2);
            const spot = spots[i];
            const dim = Math.max(0, ...spots.filter((_, j) => j !== i));
            const count = tween(frame, start + 10, start + 58, 0, 1, EASE_OUT);
            const style: CSSProperties = {
              position: 'absolute',
              left: GRID.left + col * (TILE_W + GRID.gapX),
              top: GRID.top + row * (TILE_H + GRID.gapY),
              width: TILE_W,
              height: TILE_H,
              transformOrigin: '50% 100%',
              opacity: tween(frame, start, start + 12, 0, 1) * (1 - 0.42 * dim),
              transform: `translateY(${(1 - e) * 400 - 10 * spot}px) rotateX(${(1 - e) * 58}deg) rotateZ(${(1 - e) * (col ? 5 : -5) + UNSNAP}deg) scale(${(0.84 + 0.16 * e) * (1 + 0.05 * spot - 0.025 * dim)})`,
              filter: dim > 0.01 ? `blur(${2.6 * dim}px)` : undefined,
              zIndex: spot > 0.01 ? 2 : 1,
            };
            const Icon = [CalendarCheck, ShieldCheck, FileText, ClipboardList][i];
            return (
              <div key={tile.key} style={style}>
                <Tile
                  theme={theme}
                  feature={tile.key}
                  icon={<Icon size={38} color={feat[tile.key].ink} />}
                  value={tile.value ? tile.value(count) : undefined}
                  label={tile.label}
                  caption={tile.caption}
                  badge={tile.badge}
                  spot={spot}
                  badgeCheck={tween(frame, T.tour + i * T.step + 8, T.tour + i * T.step + 24, 0, 1, EASE_OUT)}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      <Grain theme={theme} />
    </AbsoluteFill>
  );
};
