import { Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Button, Card, Icon, Text } from '@/components/ui';
import { dur, ease, STAGGER_MS } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

function Bar({ fraction, index, color, track }: { fraction: number; index: number; color: string; track: string }) {
  const reduced = useReducedMotion();
  const w = useSharedValue(reduced ? fraction : 0);
  useEffect(() => {
    w.value = reduced ? fraction : withDelay(index * STAGGER_MS * 3, withTiming(fraction, { duration: dur.base * 1.5, easing: ease.base }));
  }, [fraction, index, reduced, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[styles.track, { backgroundColor: track }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />
    </View>
  );
}

/** Per-dimension summary, clearly labelled as a sample. */
export function ResultView({
  title,
  result,
  onDone,
}: {
  title: string;
  result: Record<string, { score: number; max: number }>;
  onDone: () => void;
}) {
  const { c, feature } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: feature.assessments.fill }]}>
        <Icon icon={Sparkles} size={30} color={feature.assessments.ink} />
      </View>
      <Text variant="title" center>
        ทำเสร็จแล้ว
      </Text>
      <Text variant="body" tone="secondary" center>
        {title}
      </Text>
      <Card style={styles.card}>
        {Object.entries(result).map(([dimension, r], i) => (
          <View key={dimension} style={styles.row} accessible accessibilityLabel={`ด้าน${dimension} ${r.score} จาก ${r.max}`}>
            <View style={styles.rowHead}>
              <Text variant="label">{`ด้าน${dimension}`}</Text>
              <Text variant="data" size={14} tone="secondary">
                {`${r.score}/${r.max}`}
              </Text>
            </View>
            <Bar fraction={r.max ? r.score / r.max : 0} index={i} color={feature.assessments.fill} track={c.hairline} />
          </View>
        ))}
      </Card>
      <Text variant="caption" tone="secondary" center>
        ผลนี้เป็นตัวอย่างเพื่อการสาธิต ผลจริงจะส่งให้ครูแนะแนวพิจารณา
      </Text>
      <Button title="เสร็จสิ้น" variant="primary" onPress={onDone} style={styles.stretch} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingTop: 16 },
  badge: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  card: { alignSelf: 'stretch', gap: 16, marginVertical: 10 },
  row: { gap: 8 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  stretch: { alignSelf: 'stretch', marginTop: 6 },
});
