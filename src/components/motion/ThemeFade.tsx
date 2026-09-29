import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Softens a light/dark switch: a veil of the old canvas colour dissolves over
 * the newly themed app, like room lights dimming rather than flicking.
 */
export function ThemeFade() {
  const { c, scheme } = useTheme();
  const reduced = useReducedMotion();
  const previous = useRef({ scheme, canvas: c.canvas });
  const [veil, setVeil] = useState<string | null>(null);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const prev = previous.current;
    previous.current = { scheme, canvas: c.canvas };
    if (prev.scheme === scheme || reduced) return;
    setVeil(prev.canvas);
    opacity.value = 0.92;
    opacity.value = withTiming(0, { duration: dur.base * 1.5, easing: ease.slow }, (done) => {
      if (done) scheduleOnRN(setVeil, null);
    });
  }, [scheme, c.canvas, reduced, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  if (!veil) return null;
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: veil, zIndex: 2000 }, style]} />;
}
