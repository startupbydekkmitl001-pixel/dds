import { router, type Href } from 'expo-router';
import { CircleCheck, Info, TriangleAlert } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { dur, ease, springSoft } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { GlassLayers } from './Glass';
import { Icon } from './Icon';
import { Text } from './Text';

type ToastKind = 'info' | 'success' | 'error';
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
  href?: string;
}

const useToastStore = create<{ current: ToastItem | null; seq: number }>(() => ({ current: null, seq: 0 }));

export function toast(message: string, opts?: { kind?: ToastKind; href?: string }): void {
  const seq = useToastStore.getState().seq + 1;
  useToastStore.setState({ seq, current: { id: seq, message, kind: opts?.kind ?? 'info', href: opts?.href } });
}

const HIDE_AFTER_MS = 2600;
const ICON = { info: Info, success: CircleCheck, error: TriangleAlert } as const;

/** Mount once near the root. A glass pill drops in under the status bar, auto-hides, taps navigate. */
export function ToastHost() {
  const { c, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const current = useToastStore((s) => s.current);
  const [shown, setShown] = useState<ToastItem | null>(null);
  const y = useSharedValue(-120);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!current) return;
    setShown(current);
    y.value = withSpring(0, springSoft);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      y.value = withTiming(-120, { duration: dur.base, easing: ease.base });
    }, HIDE_AFTER_MS);
    return () => clearTimeout(timer.current);
  }, [current, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  if (!shown) return null;

  const onPress = () => {
    y.value = withTiming(-120, { duration: dur.fast });
    if (shown.href) router.push(shown.href as Href);
  };
  const iconColor = shown.kind === 'error' ? c.dangerText : shown.kind === 'success' ? c.successText : c.link;

  return (
    <Animated.View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }, style]}>
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        onPress={onPress}
        style={[styles.pill, { boxShadow: elevation.high }]}
      >
        <GlassLayers radius={999} blur strong intensity={60} />
        <Icon icon={ICON[shown.kind]} size={18} color={iconColor} />
        <View style={styles.msg}>
          <Text variant="label" numberOfLines={2}>
            {shown.message}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 1000 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, maxWidth: 520 },
  msg: { flexShrink: 1 },
});
