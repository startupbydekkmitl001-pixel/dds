import { useEffect, useId, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { dur, ease } from '@/theme/motion';

export interface OrbSpec {
  color: string;
  /** Centre, as a fraction of the container (0–1). */
  x: number;
  y: number;
  /** Radius as a fraction of the container width. */
  r: number;
  opacity: number;
}

/** A soft radial light: solid-ish core that falls off to nothing. No blur filter needed. */
export function SoftLight({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  const id = `sl${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={size} height={size} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.62} />
          <Stop offset="0.75" stopColor={color} stopOpacity={opacity * 0.2} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

function Orb({
  spec,
  index,
  width,
  height,
  drift,
  scrollY,
  parallax,
}: {
  spec: OrbSpec;
  index: number;
  width: number;
  height: number;
  drift: boolean;
  scrollY?: SharedValue<number>;
  parallax: number;
}) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  const size = Math.round(spec.r * 2 * width);
  const amp = Math.max(10, width * 0.06);

  useEffect(() => {
    if (!drift || reduced) return;
    t.value = withDelay(
      index * 700,
      withRepeat(withTiming(1, { duration: dur.drift + index * 2300, easing: ease.slow }), -1, true),
    );
    return () => cancelAnimation(t);
  }, [drift, reduced, index, t]);

  const style = useAnimatedStyle(() => {
    const dir = index % 2 === 0 ? 1 : -1;
    const sy = scrollY ? Math.max(-400, Math.min(1200, scrollY.value)) * parallax * (1 + index * 0.35) : 0;
    return {
      transform: [
        { translateX: interpolate(t.value, [0, 1], [-amp, amp]) * dir },
        { translateY: interpolate(t.value, [0, 1], [amp * 0.6, -amp * 0.6]) - sy },
        { scale: interpolate(t.value, [0, 0.5, 1], [1, 1.08, 1]) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: spec.x * width - size / 2, top: spec.y * height - size / 2, width: size, height: size }, style]}
    >
      <SoftLight size={size} color={spec.color} opacity={spec.opacity} />
    </Animated.View>
  );
}

/**
 * Soft pools of coloured light that drift very slowly (static under Reduce Motion).
 * Fills its parent; pass `scrollY` for a gentle parallax that adds depth.
 */
export function Aurora({
  orbs,
  drift = true,
  scrollY,
  parallax = 0.12,
  style,
}: {
  orbs: OrbSpec[];
  drift?: boolean;
  scrollY?: SharedValue<number>;
  parallax?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== box.width || height !== box.height) setBox({ width, height });
      }}
    >
      {box.width > 0
        ? orbs.map((o, i) => (
            <Orb key={i} spec={o} index={i} width={box.width} height={box.height} drift={drift} scrollY={scrollY} parallax={parallax} />
          ))
        : null}
    </View>
  );
}
