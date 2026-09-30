import type { CSSProperties, ReactNode } from 'react';
import { Loop, OffthreadVideo, staticFile } from 'remotion';
import { DrawnCheck } from './bits';
import { FEATURES, FONT, PALETTE, type FeatureKey, type ThemeName } from './theme';

export const TILE_W = 450;
export const TILE_H = 430;
const ART_H = 212;

/**
 * A Home tile as the app draws it: the feature's looping art on top (with a frosted icon chip),
 * the live number, label and caption below on glass. `spot` (0..1) is the tour's spotlight:
 * the tile lifts, glows in its feature colour and a badge rises over the art.
 */
export function Tile({
  theme,
  feature,
  icon,
  value,
  label,
  caption,
  badge,
  spot,
  badgeCheck,
}: {
  theme: ThemeName;
  feature: FeatureKey;
  icon: ReactNode;
  value?: string;
  label: string;
  caption: string;
  badge: string;
  spot: number;
  badgeCheck: number;
}) {
  const c = PALETTE[theme];
  const f = FEATURES[theme][feature];
  const tile: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 64,
    padding: 14,
    background: c.glass,
    border: `3px solid ${c.glassBorder}`,
    boxShadow: `inset 0 3px 0 ${c.gloss}, 0 36px 90px ${c.shadowDeep}, 0 0 0 ${4 * spot}px ${f.glow}, 0 30px ${110 * spot}px ${f.glow}${Math.round(90 * spot).toString(16).padStart(2, '0')}`,
    backdropFilter: 'blur(40px) saturate(1.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };
  return (
    <div style={tile}>
      <div style={{ position: 'relative', height: ART_H, borderRadius: 50, overflow: 'hidden', background: f.fill, flex: 'none', border: `2px solid ${c.glassBorder}` }}>
        <Loop durationInFrames={360} layout="none">
          <OffthreadVideo muted src={staticFile(`loops/${feature}-${theme}.mp4`)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </Loop>
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: c.glassStrong,
            border: `2px solid ${c.glassBorder}`,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </div>
        {/* Spotlight badge */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: 64,
            padding: '0 26px 0 12px',
            borderRadius: 999,
            background: c.glassStrong,
            border: `2px solid ${c.glassBorder}`,
            color: f.ink,
            font: `500 28px/1.3 ${FONT.ui}`,
            opacity: spot,
            transform: `translateY(${(1 - spot) * 36}px) scale(${0.9 + 0.1 * spot})`,
            transformOrigin: 'left bottom',
            boxShadow: `0 10px 30px ${c.shadow}`,
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: c.success, display: 'grid', placeItems: 'center' }}>
            <DrawnCheck size={26} color="#fff" progress={badgeCheck} width={3.4} />
          </div>
          {badge}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 20px 14px', color: c.text }}>
        {value !== undefined ? <div style={{ font: `300 76px/1.25 ${FONT.display}`, letterSpacing: '-0.01em' }}>{value}</div> : null}
        <div style={{ font: `500 36px/1.35 ${FONT.ui}` }}>{label}</div>
        <div style={{ font: `400 28px/1.35 ${FONT.ui}`, color: c.text2 }}>{caption}</div>
      </div>
    </div>
  );
}
