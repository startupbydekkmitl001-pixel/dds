import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { dur } from '@/theme/motion';
import { prism, withAlpha } from '@/theme/tokens';
import { useTilt } from './useTilt';

/**
 * Vivid+Co's prism: a slow diagonal band of RGB-split light sweeping across a
 * card, nudged by the phone's tilt. Purely decorative; hidden under Reduce Motion.
 */
export function PrismShimmer({ radius, intensity = 0.18 }: { radius: number; intensity?: number }) {
  const reduced = useReducedMotion();
  const tilt = useTilt();
  const [width, setWidth] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (reduced || width === 0) return;
    sweep.value = 0;
    sweep.value = withRepeat(withTiming(1, { duration: dur.shimmer, easing: Easing.linear }), -1, false);
  }, [reduced, width, sweep]);

  const band = Math.max(120, width * 0.55);
  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: -band + sweep.value * (width + band * 2) + tilt.value * 24 },
      { rotate: '-18deg' },
    ],
  }));

  if (reduced) return null;

  const colors = [
    'transparent',
    withAlpha(prism[0], intensity),
    withAlpha(prism[1], intensity),
    withAlpha(prism[2], intensity * 0.8),
    'transparent',
  ] as const;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Animated.View style={[styles.band, { width: band }, animated]}>
          <LinearGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute', top: '-50%', bottom: '-50%', left: 0 },
});
