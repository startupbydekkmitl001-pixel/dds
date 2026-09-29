/**
 * One motion language from the four references (spec §4.4):
 * Origin's quick 200ms ease, Vivid+Co's focus-pull curve for meaningful moves,
 * Origin's long atmospheric reveal, and springs that never overshoot.
 */
import { Easing } from 'react-native-reanimated';

export const dur = { fast: 200, base: 450, slow: 1400, shimmer: 6650 } as const;

export const ease = {
  standard: Easing.ease,
  base: Easing.bezier(0.52, 0.01, 0, 1),
  slow: Easing.bezier(0.455, 0.03, 0.515, 0.955),
};

export const spring = { damping: 20, stiffness: 180, overshootClamping: true } as const;

export const STAGGER_MS = 40;
export const STAGGER_MAX = 8;
export const PRESS_SCALE = 0.97;
