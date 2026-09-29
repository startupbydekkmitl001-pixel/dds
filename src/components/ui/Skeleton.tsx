import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { white, withAlpha } from '@/theme/tokens';

/** Empty glass with a soft band of light gliding across it. Static under Reduce Motion. */
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
  const { c, scheme, radius: r } = useTheme();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (reduced || w === 0) return;
    sweep.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, false);
    return () => cancelAnimation(sweep);
  }, [reduced, w, sweep]);

  const band = useAnimatedStyle(() => ({ transform: [{ translateX: -w * 0.6 + sweep.value * w * 1.6 }] }));
  const shine = withAlpha(white, scheme === 'dark' ? 0.07 : 0.6);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[
        { width, height, borderRadius: radius ?? r.card, backgroundColor: c.glass, borderWidth: 1, borderColor: c.glassBorder, overflow: 'hidden' },
        style,
      ]}
    >
      {w > 0 && !reduced ? (
        <Animated.View style={[StyleSheet.absoluteFill, { width: w * 0.6 }, band]}>
          <LinearGradient colors={['transparent', shine, 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
    </View>
  );
}
