import { BlurView } from 'expo-blur';
import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { dur, ease, springSoft } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { GlassLayers } from './Glass';

const CAN_BLUR = Platform.OS === 'ios' || Platform.OS === 'web';

/**
 * A floating glass sheet: the world behind softly blurs and dims, the sheet
 * glides up and can be dragged down (or the backdrop tapped) to dismiss.
 */
export function GlassSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const { c, scheme, radius, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const [height, setHeight] = useState(420);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.value = 0;
      progress.value = withTiming(1, { duration: reduced ? dur.fast : dur.base * 1.2, easing: ease.out });
      return;
    }
    progress.value = withTiming(0, { duration: dur.fast + 60, easing: ease.standard });
    const t = setTimeout(() => setMounted(false), dur.fast + 80);
    return () => clearTimeout(t);
  }, [visible, progress, drag, reduced]);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      drag.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 90 || e.velocityY > 900) scheduleOnRN(onClose);
      else drag.value = withSpring(0, springSoft);
    });

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value * (1 - Math.min(1, drag.value / (height * 1.4))) }));
  const sheet = useAnimatedStyle(() => ({
    opacity: reduced ? progress.value : 1,
    transform: [{ translateY: (reduced ? 0 : (1 - progress.value) * (height + 60)) + drag.value }],
  }));

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, backdrop]}>
          {CAN_BLUR ? <BlurView intensity={22} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} /> : null}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} />
          <Pressable style={styles.fill} onPress={onClose} accessibilityRole="button" accessibilityLabel="ปิด" />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
            style={[
              styles.sheet,
              { bottom: Math.max(insets.bottom, 10), borderRadius: radius.sheet, boxShadow: elevation.high },
              sheet,
            ]}
          >
            <GlassLayers radius={radius.sheet} blur strong intensity={70} />
            <View style={[styles.grabber, { backgroundColor: c.textSecondary }]} />
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sheet: { position: 'absolute', left: 10, right: 10, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 18, gap: 10, maxWidth: 560, alignSelf: 'center' },
  grabber: { alignSelf: 'center', width: 38, height: 5, borderRadius: 3, marginBottom: 8, opacity: 0.35 },
});
