import { House, School } from 'lucide-react-native';
import { useEffect, useId, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { GlassLayers, Icon, Text } from '@/components/ui';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { white } from '@/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const H = 64;
const NODE = 36;
const SAMPLES = 48;

type Point = { x: number; y: number };

function cubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/**
 * Home → school as a soft route (after the travel-app reference). The glowing
 * traveller shows where today stands: at home, on the way (pulsing), or arrived.
 */
export function Journey({
  progress,
  color,
  endLabel,
  waiting,
}: {
  /** 0 = at home, 1 = at school. */
  progress: number;
  color: string;
  endLabel?: string;
  /** Pulse the traveller while we wait for a scan. */
  waiting?: boolean;
}) {
  const { c, feature, elevation } = useTheme();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const f = useSharedValue(reduced ? progress : 0);
  const pulse = useSharedValue(0);
  const gid = `jt${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const geo = useMemo(() => {
    if (w === 0) return null;
    const p0 = { x: NODE / 2, y: H - NODE / 2 - 2 };
    const p3 = { x: w - NODE / 2, y: NODE / 2 + 2 };
    const p1 = { x: w * 0.38, y: H + 8 };
    const p2 = { x: w * 0.58, y: -10 };
    const xs: number[] = [];
    const ys: number[] = [];
    const lens: number[] = [0];
    for (let i = 0; i <= SAMPLES; i++) {
      const p = cubic(p0, p1, p2, p3, i / SAMPLES);
      xs.push(p.x);
      ys.push(p.y);
      if (i > 0) lens.push(lens[i - 1] + Math.hypot(p.x - xs[i - 1], p.y - ys[i - 1]));
    }
    const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
    return { d, xs, ys, lens, total: lens[lens.length - 1] };
  }, [w]);

  useEffect(() => {
    f.value = reduced ? progress : withDelay(250, withTiming(progress, { duration: dur.slow, easing: ease.out }));
  }, [progress, reduced, f]);

  useEffect(() => {
    if (!waiting || reduced) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
    return () => cancelAnimation(pulse);
  }, [waiting, reduced, pulse]);

  const total = geo?.total ?? 1;
  const trail = useAnimatedProps(() => ({ strokeDashoffset: total * (1 - f.value) }));

  const xs = geo?.xs ?? [0];
  const ys = geo?.ys ?? [0];
  const lens = geo?.lens ?? [0];
  const traveller = useAnimatedStyle(() => {
    const target = f.value * total;
    let i = 1;
    while (i < lens.length - 1 && lens[i] < target) i++;
    const seg = Math.max(1e-6, lens[i] - lens[i - 1]);
    const k = Math.min(1, Math.max(0, (target - lens[i - 1]) / seg));
    const x = xs.length > 1 ? xs[i - 1] + (xs[i] - xs[i - 1]) * k : 0;
    const y = ys.length > 1 ? ys[i - 1] + (ys[i] - ys[i - 1]) * k : 0;
    return { transform: [{ translateX: x - 9 }, { translateY: y - 9 }] };
  });
  const halo = useAnimatedStyle(() => ({ opacity: waiting ? 0.55 * (1 - pulse.value) : 0.35, transform: [{ scale: waiting ? 1 + pulse.value * 1.4 : 1.4 }] }));

  return (
    <View style={styles.wrap} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {geo ? (
        <>
          <Svg width={w} height={H} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={feature.attendance.glow} />
                <Stop offset="1" stopColor={color} />
              </LinearGradient>
            </Defs>
            <Path d={geo.d} stroke={c.textSecondary} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray={[2, 6]} strokeLinecap="round" fill="none" />
            <AnimatedPath
              d={geo.d}
              stroke={`url(#${gid})`}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={[geo.total, geo.total]}
              animatedProps={trail}
            />
          </Svg>
          <View style={[styles.node, { left: 0, top: H - NODE - 2, boxShadow: elevation.low }]}>
            <GlassLayers radius={NODE / 2} />
            <Icon icon={House} size={16} color={c.textSecondary} />
          </View>
          <View style={[styles.node, { right: 0, top: 2, boxShadow: elevation.low }]}>
            <GlassLayers radius={NODE / 2} tint={progress >= 1 ? feature.attendance.fill : undefined} />
            <Icon icon={School} size={16} color={progress >= 1 ? feature.attendance.ink : c.textSecondary} />
          </View>
          <Animated.View style={[styles.traveller, traveller]} pointerEvents="none">
            <Animated.View style={[styles.halo, { backgroundColor: color }, halo]} />
            <View style={[styles.dot, { backgroundColor: color, borderColor: white }]} />
          </Animated.View>
        </>
      ) : null}
      {endLabel ? (
        <Text variant="data" size={12} tone="secondary" style={styles.endLabel}>
          {endLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: H + 18, marginTop: 10 },
  node: { position: 'absolute', width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  traveller: { position: 'absolute', left: 0, top: 0, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 18, height: 18, borderRadius: 9 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
  endLabel: { position: 'absolute', right: 0, top: NODE + 6, textAlign: 'right' },
});
