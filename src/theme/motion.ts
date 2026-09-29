/**
 * One calm motion language: a quick 200ms ease for touch, a focus-pull curve
 * for meaningful moves, a long atmospheric reveal, soft springs for things
 * that settle (thumbs, sheets, cards) and very slow drifts for ambient light.
 */
import { Easing } from 'react-native-reanimated';

export const dur = { fast: 200, base: 450, slow: 1400, shimmer: 6650, drift: 16000 } as const;

export const ease = {
  standard: Easing.ease,
  base: Easing.bezier(0.52, 0.01, 0, 1),
  slow: Easing.bezier(0.455, 0.03, 0.515, 0.955),
  /** Gentle deceleration for things arriving on screen. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
};

/** Critically damped: settles without overshoot. */
export const spring = { damping: 20, stiffness: 180, overshootClamping: true } as const;
/** A hair of give — for thumbs, pills and sheets that should feel physical but serene. */
export const springSoft = { damping: 18, stiffness: 170, mass: 0.9 } as const;

export const STAGGER_MS = 40;
export const STAGGER_MAX = 8;
export const PRESS_SCALE = 0.97;
