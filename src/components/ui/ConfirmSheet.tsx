import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

/** Bottom confirmation sheet for consequential actions (freeze card, log out, reset). */
export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { c, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: dur.base, easing: ease.base });
      return;
    }
    progress.value = withTiming(0, { duration: dur.fast, easing: ease.standard });
    const t = setTimeout(() => setMounted(false), dur.fast);
    return () => clearTimeout(t);
  }, [visible, progress]);

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * 360 }] }));

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }, backdrop]}>
          <Pressable style={styles.fill} onPress={onCancel} accessibilityLabel="ปิด" />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { backgroundColor: c.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingBottom: insets.bottom + 16 },
            sheet,
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: c.hairline }]} />
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="body" tone="secondary">
            {body}
          </Text>
          <View style={styles.actions}>
            <Button title={confirmLabel} variant="primary" destructive={destructive} onPress={onConfirm} />
            <Button title="ยกเลิก" variant="ghost" onPress={onCancel} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 12, gap: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 10 },
  actions: { marginTop: 12, gap: 4 },
});
