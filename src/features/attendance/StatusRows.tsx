import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import type { AttendanceStatus } from '@/data/types';
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/attendance';
import { useTheme } from '@/theme/ThemeProvider';

/** Six status rows with real numbers (the old app showed lines but no counts). */
export function StatusRows({ counts }: { counts: Record<AttendanceStatus, number> }) {
  const { c, statusColor } = useTheme();
  const max = Math.max(1, ...STATUS_ORDER.map((k) => counts[k]));
  return (
    <View style={styles.list}>
      {STATUS_ORDER.map((k) => (
        <View key={k} style={styles.row} accessible accessibilityLabel={`${STATUS_LABEL[k]} ${counts[k]} วัน`}>
          <View style={[styles.dot, { backgroundColor: statusColor[k] }]} />
          <Text variant="body" style={styles.label}>
            {STATUS_LABEL[k]}
          </Text>
          <View style={[styles.track, { backgroundColor: c.hairline }]}>
            <View style={[styles.fill, { width: `${(counts[k] / max) * 100}%`, backgroundColor: statusColor[k] }]} />
          </View>
          <View style={styles.count}>
            <Text variant="data" size={16}>
              {String(counts[k])}
            </Text>
            <Text variant="caption" tone="secondary">
              วัน
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { width: 76 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  count: { flexDirection: 'row', alignItems: 'baseline', gap: 4, minWidth: 56, justifyContent: 'flex-end' },
});
