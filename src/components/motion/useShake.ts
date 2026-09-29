import { useCallback } from 'react';
import { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

const STEP_MS = 40; // 8 steps → 320ms

/** Horizontal "no" shake: 4 cycles, ±8pt. Does nothing under Reduce Motion. */
export function useShake() {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const shake = useCallback(() => {
    if (reduced) return;
    const t = (to: number) => withTiming(to, { duration: STEP_MS });
    x.value = withSequence(t(-8), t(8), t(-8), t(8), t(-8), t(8), t(-4), t(0));
  }, [reduced, x]);

  return { style, shake };
}
