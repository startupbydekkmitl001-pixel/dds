import { useEffect, useId } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { white } from '@/theme/tokens';

/**
 * A glossy pastel sphere: lit from the upper left, with a soft contact shadow
 * that breathes as the sphere floats. Decorative only.
 */
export function GlossOrb({
  size,
  color,
  deep,
  float = true,
  delay = 0,
}: {
  size: number;
  /** Body colour. */
  color: string;
  /** Shade on the far side (defaults to `color`). */
  deep?: string;
  float?: boolean;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const body = `ob${raw}`;
  const shade = `os${raw}`;
  const t = useSharedValue(0);

  useEffect(() => {
    if (!float || reduced) return;
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(t);
  }, [float, reduced, delay, t]);

  const sphere = useAnimatedStyle(() => ({ transform: [{ translateY: -t.value * size * 0.08 }] }));
  const shadow = useAnimatedStyle(() => ({ opacity: 0.55 - t.value * 0.2, transform: [{ scaleX: 1 - t.value * 0.12 }] }));
  const h = size * 1.18;

  return (
    <Animated.View style={{ width: size, height: h }} pointerEvents="none">
      <Animated.View style={[{ position: 'absolute', left: 0, top: size * 0.98, width: size, height: size * 0.2 }, shadow]}>
        <Svg width={size} height={size * 0.2}>
          <Defs>
            <RadialGradient id={shade} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={deep ?? color} stopOpacity={0.55} />
              <Stop offset="1" stopColor={deep ?? color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={size / 2} cy={size * 0.1} rx={size * 0.42} ry={size * 0.09} fill={`url(#${shade})`} />
        </Svg>
      </Animated.View>
      <Animated.View style={sphere}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id={body} cx="36%" cy="30%" r="72%" fx="34%" fy="26%">
              <Stop offset="0" stopColor={white} stopOpacity={0.95} />
              <Stop offset="0.28" stopColor={color} stopOpacity={0.95} />
              <Stop offset="0.8" stopColor={deep ?? color} stopOpacity={1} />
              <Stop offset="1" stopColor={deep ?? color} stopOpacity={1} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2 - 0.5} fill={`url(#${body})`} />
          {/* Rim light on the lower right, like light passing through glass. */}
          <Circle cx={size / 2} cy={size / 2} r={size / 2 - 1.2} fill="none" stroke={white} strokeOpacity={0.35} strokeWidth={1.2} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
