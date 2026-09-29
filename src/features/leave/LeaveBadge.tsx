import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import type { LeaveStatus } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

export function LeaveBadge({ status }: { status: LeaveStatus }) {
  const { statusColor } = useTheme();
  const { label, color } =
    status === 'submitted'
      ? { label: 'รออนุมัติ', color: statusColor.late }
      : status === 'rejected'
        ? { label: 'ไม่อนุมัติ', color: statusColor.absent }
        : { label: 'อนุมัติแล้ว', color: statusColor.present };
  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.15) }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
