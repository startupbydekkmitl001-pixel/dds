import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { haptic as haptics } from '@/lib/haptics';
import { dur, ease, PRESS_SCALE } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: 'selection' | 'light' | false;
};

/** Pressable that dips to 97% while held (Origin's quick 200ms ease). */
export function PressableScale({
  scaleTo = PRESS_SCALE,
  haptic = false,
  onPressIn,
  onPressOut,
  onPress,
  style,
  accessibilityRole = 'button',
  ...rest
}: PressableScaleProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      {...rest}
      onPressIn={(e: GestureResponderEvent) => {
        if (!reduced) scale.value = withTiming(scaleTo, { duration: dur.fast, easing: ease.standard });
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        scale.value = withTiming(1, { duration: dur.fast, easing: ease.standard });
        onPressOut?.(e);
      }}
      onPress={(e: GestureResponderEvent) => {
        if (haptic === 'selection') haptics.selection();
        else if (haptic === 'light') haptics.light();
        onPress?.(e);
      }}
      style={[style, animated]}
    />
  );
}
