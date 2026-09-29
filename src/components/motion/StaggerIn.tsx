import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { dur, ease, STAGGER_MAX, STAGGER_MS } from '@/theme/motion';

/** Fade + 12pt rise, delayed by list position (capped at 8 items). */
export function StaggerIn({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const delay = Math.min(index, STAGGER_MAX) * STAGGER_MS;
    progress.value = withDelay(
      reduced ? 0 : delay,
      withTiming(1, { duration: reduced ? dur.fast : dur.base, easing: ease.base }),
    );
  }, [index, progress, reduced]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: reduced ? 0 : (1 - progress.value) * 12 }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
