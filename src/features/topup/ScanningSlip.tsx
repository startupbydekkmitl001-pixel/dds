import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';
import { SLIP_H, SLIP_W, SlipThumb } from './SlipThumb';

export const SCAN_MS = 2400;

/** A scan line sweeps the slip three times while "the bank" is checked. */
export function ScanningSlip({ uri, amount, onDone }: { uri: string; amount: number; onDone: () => void }) {
  const { c, feature } = useTheme();
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!reduced) y.value = withRepeat(withTiming(1, { duration: SCAN_MS / 3, easing: Easing.inOut(Easing.quad) }), 3, false);
    const t = setTimeout(() => done.current(), SCAN_MS);
    return () => clearTimeout(t);
  }, [reduced, y]);

  const line = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * (SLIP_H - 4) }] }));

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite" accessibilityLabel="กำลังตรวจสอบสลิป">
      <View style={styles.slip}>
        <SlipThumb uri={uri} amount={amount} />
        {!reduced ? (
          <Animated.View style={[styles.line, { backgroundColor: feature.wallet.fill }, line]}>
            <View style={[styles.glow, { backgroundColor: withAlpha(feature.wallet.fill, 0.25) }]} />
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.row}>
        <ActivityIndicator color={c.textSecondary} />
        <Text variant="body" tone="secondary">
          กำลังตรวจสอบสลิป…
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 20, paddingVertical: 12 },
  slip: { width: SLIP_W, height: SLIP_H, overflow: 'hidden', borderRadius: 16 },
  line: { position: 'absolute', left: 0, right: 0, top: 0, height: 3 },
  glow: { position: 'absolute', left: 0, right: 0, top: -14, height: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
