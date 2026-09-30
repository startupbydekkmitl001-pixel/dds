import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { PALETTE, type ThemeName } from './theme';

/** Lucide icons (ISC), the same set the app uses. */
function Icon({ size, color, children, width = 2 }: { size: number; color: string; children: ReactNode; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
export const CalendarCheck = (p: { size: number; color: string }) => (
  <Icon {...p}>
    <path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="m9 15 2 2 4-4" />
  </Icon>
);
export const ShieldCheck = (p: { size: number; color: string }) => (
  <Icon {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);
export const FileText = (p: { size: number; color: string }) => (
  <Icon {...p}>
    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
  </Icon>
);
export const ClipboardList = (p: { size: number; color: string }) => (
  <Icon {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
  </Icon>
);
/** A check whose stroke draws on as `progress` goes 0 -> 1. */
export const DrawnCheck = ({ size, color, progress, width = 3 }: { size: number; color: string; progress: number; width?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} opacity={progress > 0 ? 1 : 0} />
  </svg>
);

/** The room every screen lives in: canvas and four slow pools of pastel light. */
export function Ambient({ theme, frame, bloom }: { theme: ThemeName; frame: number; bloom: number }) {
  const c = PALETTE[theme];
  const orbs: { x: number; y: number; dx: number; dy: number; phase: number }[] = [
    { x: -420, y: -360, dx: 70, dy: 90, phase: 0 },
    { x: 360, y: 360, dx: -80, dy: 60, phase: 1.3 },
    { x: -480, y: 1180, dx: 90, dy: -70, phase: 2.1 },
    { x: 300, y: 1620, dx: -60, dy: -90, phase: 3.4 },
  ];
  const t = frame / 60;
  return (
    <AbsoluteFill style={{ background: c.canvas, overflow: 'hidden' }}>
      {orbs.map((o, i) => {
        const a = (Math.PI * 2 * t) / 7.2 + o.phase;
        const style: CSSProperties = {
          position: 'absolute',
          left: o.x,
          top: o.y,
          width: 1180,
          height: 1180,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c.ambient[i]} 0%, ${c.ambient[i]}b8 26%, ${c.ambient[i]}3d 50%, transparent 70%)`,
          opacity: c.ambientOpacity * bloom,
          transform: `translate(${o.dx * Math.sin(a)}px, ${o.dy * Math.cos(a)}px) scale(${0.72 + 0.28 * bloom})`,
        };
        return <div key={i} style={style} />;
      })}
    </AbsoluteFill>
  );
}

/** Static film grain: dithers the soft gradients so H.264 never bands them. */
export function Grain({ theme }: { theme: ThemeName }) {
  const c = PALETTE[theme];
  const svg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";
  return (
    <AbsoluteFill
      style={{ backgroundImage: `url("${svg}")`, opacity: c.grainOpacity, mixBlendMode: c.grainBlend as CSSProperties['mixBlendMode'], pointerEvents: 'none' }}
    />
  );
}

/** A decorative QR-style matrix (not scannable), deterministic so every render is identical. */
export function QrArt({ size }: { size: number }) {
  const N = 25;
  let seed = 24815;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  let d = '';
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const r = rand();
      if (finder(x, y)) continue;
      const timing = (x === 6 || y === 6) && (x + y) % 2 === 0;
      if (timing || (x !== 6 && y !== 6 && r < 0.5)) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} rx={1.4} fill="#000" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={0.9} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="#000" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 25 25" shapeRendering="crispEdges">
      <path d={d} fill="#000" />
      {eye(0, 0)}
      {eye(18, 0)}
      {eye(0, 18)}
    </svg>
  );
}
