import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

function Segment({ active, color, track }: { active: boolean; color: string; track: string }) {
  const fill = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    fill.value = withTiming(active ? 1 : 0, { duration: dur.base, easing: ease.base });
  }, [active, fill]);
  const style = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  return (
    <View style={[styles.bar, { backgroundColor: track }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />
    </View>
  );
}

/** ①②③ progress header for multi-step flows. */
export function ProgressSteps({ steps, current }: { steps: string[]; current: number }) {
  const { c } = useTheme();
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`ขั้นตอนที่ ${current + 1} จาก ${steps.length}: ${steps[current]}`}
    >
      {steps.map((label, i) => (
        <View key={label} style={styles.step}>
          <Segment active={i <= current} color={c.text} track={c.hairline} />
          <Text variant="caption" tone={i === current ? 'primary' : 'secondary'} numberOfLines={1}>
            {`${i + 1}. ${label}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  step: { flex: 1, gap: 6 },
  bar: { height: 3, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2 },
});
