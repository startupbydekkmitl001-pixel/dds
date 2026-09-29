import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { dur, ease } from '@/theme/motion';
import { roundedRectPath, roundedRectPerimeter } from './geometry';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Origin's "borderTurn": a 1–2pt stroke tracing a rounded rect.
 * - `once`: draws 0 → full, then calls onDone (PIN success, checkmarks).
 * - `countdown`: depletes full → 0 over durationMs; restarts when cycleKey changes (pay QR).
 */
export function BorderTrace({
  width,
  height,
  radius,
  color,
  strokeWidth = 2,
  mode,
  durationMs,
  cycleKey,
  onDone,
}: {
  width: number;
  height: number;
  radius: number;
  color: string;
  strokeWidth?: number;
  mode: 'once' | 'countdown';
  durationMs?: number;
  cycleKey?: string | number;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const inset = strokeWidth / 2;
  const d = roundedRectPath(width, height, radius, inset);
  const length = roundedRectPerimeter(width - strokeWidth, height - strokeWidth, radius - inset);
  const visible = useSharedValue(mode === 'countdown' ? 1 : 0);
  const opacity = useSharedValue(1);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (mode === 'once') {
      const total = reduced ? dur.fast : (durationMs ?? dur.base * 2);
      if (reduced) {
        visible.value = 1;
        opacity.value = 0;
        opacity.value = withTiming(1, { duration: dur.fast });
      } else {
        visible.value = 0;
        visible.value = withTiming(1, { duration: total, easing: ease.base });
      }
      timer = setTimeout(() => doneRef.current?.(), total);
    } else {
      visible.value = 1;
      visible.value = withTiming(0, { duration: durationMs ?? 60_000, easing: Easing.linear });
    }
    return () => clearTimeout(timer);
  }, [mode, cycleKey, durationMs, reduced, visible, opacity]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - visible.value),
    strokeOpacity: opacity.value,
  }));

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatedPath
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={[length, length]}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
