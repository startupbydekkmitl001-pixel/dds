import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { springSoft } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { white } from '@/theme/tokens';

const W = 52;
const H = 32;
const KNOB = 26;

/** Glass switch: the track warms to lavender and a glossy pearl knob glides across. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { c, elevation } = useTheme();
  const reduced = useReducedMotion();
  const p = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    p.value = reduced ? (value ? 1 : 0) : withSpring(value ? 1 : 0, springSoft);
  }, [value, reduced, p]);

  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(p.value, [0, 1], [c.hairline, c.accent]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: p.value * (W - KNOB - 6) }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => {
        haptic.selection();
        onChange(!value);
      }}
    >
      <Animated.View style={[styles.track, { borderColor: c.glassBorder }, track]}>
        <Animated.View style={[styles.knob, { backgroundColor: white, boxShadow: elevation.low }, knob]}>
          <View style={[styles.shine, { backgroundColor: c.canvas }]} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, padding: 2, borderWidth: 1, justifyContent: 'center' },
  knob: { width: KNOB, height: KNOB, borderRadius: KNOB / 2, marginLeft: 1, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  shine: { width: KNOB, height: KNOB * 0.4, opacity: 0.35 },
});
