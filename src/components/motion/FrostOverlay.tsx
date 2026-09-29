import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { white, withAlpha } from '@/theme/tokens';

/** Stable pseudo-random in [0, 1) so particles don't reshuffle on every render. */
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const FLAKES = 22;

function Flake({ i, width, height, color }: { i: number; width: number; height: number; color: string }) {
  const reduced = useReducedMotion();
  const fall = useSharedValue(rand(i, 1));
  const sway = useSharedValue(0);
  const size = 1.5 + rand(i, 2) * 3.2;
  const x = rand(i, 3) * width;
  const speed = 5200 + rand(i, 4) * 5200;

  useEffect(() => {
    if (reduced) return;
    const start = rand(i, 1);
    fall.value = start;
    fall.value = withSequence(
      withTiming(1, { duration: speed * (1 - start), easing: Easing.linear }),
      withRepeat(withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: speed, easing: Easing.linear })), -1, false),
    );
    sway.value = withDelay(i * 90, withRepeat(withTiming(1, { duration: 1800 + rand(i, 5) * 1600, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => {
      cancelAnimation(fall);
      cancelAnimation(sway);
    };
  }, [reduced, speed, i, fall, sway]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x + (sway.value - 0.5) * 10 }, { translateY: -8 + fall.value * (height + 16) }],
  }));

  return (
    <Animated.View
      style={[
        styles.flake,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.45 + rand(i, 6) * 0.5 },
        style,
      ]}
    />
  );
}

/** Fern-like ice crystals growing in from a corner. */
function crystal(x: number, y: number, sx: number, sy: number, len: number): string {
  const p = (dx: number, dy: number) => `${x + dx * sx} ${y + dy * sy}`;
  const segs: string[] = [`M ${p(0, 0)} L ${p(len, len * 0.55)}`];
  for (let k = 1; k <= 4; k++) {
    const t = (k / 5) * len;
    const b = len * (0.32 - k * 0.05);
    segs.push(`M ${p(t, t * 0.55)} L ${p(t + b * 0.4, t * 0.55 - b)}`);
    segs.push(`M ${p(t, t * 0.55)} L ${p(t - b * 0.2, t * 0.55 + b * 0.9)}`);
  }
  segs.push(`M ${p(0, len * 0.2)} L ${p(len * 0.5, len * 1.0)}`);
  return segs.join(' ');
}

/**
 * The frozen card: an icy tint, frosted edges, crystals in the corners and
 * slow falling snow. Fades in and out with the frozen state.
 */
export function FrostOverlay({ radius }: { radius: number }) {
  const { c, scheme } = useTheme();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const paths = useMemo(() => {
    const { width: w, height: h } = box;
    if (!w) return '';
    return [crystal(0, 0, 1, 1, 34), crystal(w, h, -1, -1, 44), crystal(w, 0, -1, 1, 22), crystal(0, h, 1, -1, 24)].join(' ');
  }, [box]);
  const edge = withAlpha(white, scheme === 'dark' ? 0.32 : 0.55);

  return (
    <Animated.View
      entering={FadeIn.duration(700)}
      exiting={FadeOut.duration(450)}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}
      onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(c.frost, c.frostAlpha) }]} />
      <LinearGradient colors={[edge, 'transparent']} locations={[0, 1]} style={[styles.edgeTop]} />
      <LinearGradient colors={['transparent', edge]} locations={[0, 1]} style={[styles.edgeBottom]} />
      <LinearGradient colors={[edge, 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.edgeLeft} />
      <LinearGradient colors={['transparent', edge]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.edgeRight} />
      {box.width > 0 ? (
        <>
          <Svg width={box.width} height={box.height} style={StyleSheet.absoluteFill}>
            <Path d={paths} stroke={c.frostInk} strokeOpacity={0.4} strokeWidth={1} strokeLinecap="round" fill="none" />
          </Svg>
          {Array.from({ length: FLAKES }, (_, i) => (
            <Flake key={i} i={i} width={box.width} height={box.height} color={c.frostInk} />
          ))}
        </>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  edgeTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 18 },
  edgeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 18 },
  edgeLeft: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 16 },
  edgeRight: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 16 },
  flake: { position: 'absolute', top: 0, left: 0 },
});
