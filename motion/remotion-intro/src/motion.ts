import { Easing, interpolate, spring, type SpringConfig } from 'remotion';

/** The app's curves (src/theme/motion.ts): `base` for meaningful moves, `out` for arrivals. */
export const EASE_BASE = Easing.bezier(0.52, 0.01, 0, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** Leaving: gathers speed smoothly, never snaps. */
export const EASE_LEAVE = Easing.bezier(0.55, 0, 0.8, 0.25);

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** A clamped tween of `frame` across [from, to]. */
export function tween(frame: number, from: number, to: number, a: number, b: number, easing = EASE_BASE): number {
  return interpolate(frame, [from, to], [a, b], { ...CLAMP, easing });
}

/** A physical spring starting at `start` (0 before it). Soft by default: settles without a bounce you notice. */
export function sp(frame: number, fps: number, start: number, config: Partial<SpringConfig> = {}): number {
  return spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 120, mass: 0.9, ...config } });
}

/** 0 -> 1 -> 0: a spring in at `a`, a spring out at `b`. */
export function pulse(frame: number, fps: number, a: number, b: number, config: Partial<SpringConfig> = {}): number {
  return Math.min(1, Math.max(0, sp(frame, fps, a, config) - sp(frame, fps, b, config)));
}
