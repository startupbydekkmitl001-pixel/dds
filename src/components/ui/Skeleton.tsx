import { useEffect } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

/** Breathing placeholder block. Static under Reduce Motion. */
export function Skeleton({
  width = '100%',
  height,
  radius,
  style,
}: {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { c, radius: r } = useTheme();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(withTiming(0.55, { duration: 900, easing: ease.slow }), -1, true);
  }, [reduced, pulse]);

  const animated = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius ?? r.card, backgroundColor: c.hairline }, animated, style]}
    />
  );
}
