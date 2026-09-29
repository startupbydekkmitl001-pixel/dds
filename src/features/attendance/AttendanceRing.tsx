import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { NumberTicker } from '@/components/motion';
import { Text } from '@/components/ui';
import type { AttendanceStatus } from '@/data/types';
import { STATUS_ORDER } from '@/lib/attendance';
import { dur, ease, STAGGER_MS } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 200;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const GAP = 3;

function Segment({ length, angle, color, index }: { length: number; angle: number; color: string; index: number }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    p.value = reduced ? 1 : withDelay(index * STAGGER_MS * 2, withTiming(1, { duration: dur.base * 1.6, easing: ease.base }));
  }, [p, reduced, index, length]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - p.value) }));
  return (
    <G transform={`rotate(${angle} ${SIZE / 2} ${SIZE / 2})`}>
      <AnimatedCircle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={[length, C]}
        animatedProps={props}
      />
    </G>
  );
}

/** Attendance ring: one arc per status, sweeping in; the centre counts up to the attendance rate. */
export function AttendanceRing({ counts, rate }: { counts: Record<AttendanceStatus, number>; rate: number }) {
  const { c, statusColor } = useTheme();
  const total = STATUS_ORDER.reduce((s, k) => s + counts[k], 0);
  let cursor = 0;
  const segments = STATUS_ORDER.filter((k) => counts[k] > 0).map((k, i) => {
    const frac = counts[k] / Math.max(1, total);
    const seg = { key: k, angle: -90 + cursor * 360, length: Math.max(0.5, frac * C - GAP), index: i };
    cursor += frac;
    return seg;
  });

  return (
    <View style={styles.wrap} accessible accessibilityLabel={`มาเรียน ${rate} เปอร์เซ็นต์`}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={c.hairline} strokeWidth={STROKE} fill="none" />
        {segments.map((s) => (
          <Segment key={s.key} length={s.length} angle={s.angle} color={statusColor[s.key]} index={s.index} />
        ))}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <NumberTicker value={rate} from={0} format={(n) => `${n}%`} size={40} />
        <Text variant="caption" tone="secondary">
          มาเรียน
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignSelf: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
