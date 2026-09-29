import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { formatBaht, parseISODate, THAI_WEEKDAY_SHORT } from '@/lib/format';
import { dur, ease, STAGGER_MS } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

const MAX_H = 96;

function Bar({ height, index, color }: { height: number; index: number; color: string }) {
  const reduced = useReducedMotion();
  const h = useSharedValue(reduced ? height : 0);
  useEffect(() => {
    h.value = reduced ? height : withDelay(index * STAGGER_MS, withTiming(height, { duration: dur.base, easing: ease.base }));
  }, [height, index, reduced, h]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

/** 7-day spending bars in soft rose light; today glows, earlier days are frosted. */
export function SpendChart({ data }: { data: { date: string; total: number }[] }) {
  const { feature } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.total));
  const total = data.reduce((s, d) => s + d.total, 0);
  return (
    <View accessible accessibilityLabel={`ใช้จ่าย 7 วันล่าสุด รวม ${formatBaht(total)}`}>
      <View style={styles.row}>
        {data.map((d, i) => {
          const isToday = i === data.length - 1;
          return (
            <View key={d.date} style={styles.col}>
              <Text variant="data" size={11} tone="secondary" style={{ opacity: isToday ? 1 : 0 }}>
                {formatBaht(d.total)}
              </Text>
              <View style={styles.track}>
                <Bar
                  height={Math.max(4, (d.total / max) * MAX_H)}
                  index={i}
                  color={isToday ? feature.wallet.glow : withAlpha(feature.wallet.glow, 0.38)}
                />
              </View>
              <Text variant="caption" tone={isToday ? 'primary' : 'secondary'}>
                {THAI_WEEKDAY_SHORT[parseISODate(d.date).getDay()]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  track: { height: MAX_H, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '62%', borderRadius: 999, minHeight: 6 },
});
