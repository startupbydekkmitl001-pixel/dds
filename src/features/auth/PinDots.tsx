import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/ui';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

function Dot({ filled, state }: { filled: boolean; state: 'idle' | 'error' | 'success' }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (filled && !reduced) {
      scale.value = withSequence(withTiming(1.35, { duration: 90 }), withTiming(1, { duration: dur.fast, easing: ease.base }));
    }
  }, [filled, reduced, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const color = state === 'error' ? c.danger : c.text;
  return (
    <Animated.View
      style={[
        styles.dot,
        { borderColor: state === 'error' ? c.danger : c.textSecondary, backgroundColor: filled ? color : 'transparent', opacity: filled || state === 'error' ? 1 : 0.55 },
        filled ? { borderColor: color } : null,
        style,
      ]}
    />
  );
}

/** Six PIN dots that pop as they fill, turn red on error, and fold into a check on success. */
export function PinDots({ length, filled, state }: { length: number; filled: number; state: 'idle' | 'error' | 'success' }) {
  const { c } = useTheme();
  const successOpacity = useSharedValue(0);

  useEffect(() => {
    successOpacity.value = withTiming(state === 'success' ? 1 : 0, { duration: dur.base, easing: ease.base });
  }, [state, successOpacity]);

  const dotsStyle = useAnimatedStyle(() => ({ opacity: 1 - successOpacity.value, transform: [{ scale: 1 - successOpacity.value * 0.4 }] }));
  const checkStyle = useAnimatedStyle(() => ({ opacity: successOpacity.value, transform: [{ scale: 0.6 + successOpacity.value * 0.4 }] }));

  return (
    <View accessibilityRole="text" accessibilityLabel={`ใส่แล้ว ${filled} จาก ${length} หลัก`}>
      <Animated.View style={[styles.row, dotsStyle]}>
        {Array.from({ length }, (_, i) => (
          <Dot key={i} filled={i < filled} state={state} />
        ))}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, checkStyle]} pointerEvents="none">
        <Icon icon={Check} size={30} color={c.success} strokeWidth={2.4} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 20, height: 32, alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5 },
});
