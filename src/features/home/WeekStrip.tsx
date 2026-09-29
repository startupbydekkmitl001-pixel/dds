import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from '@/components/ui';
import type { AttendanceStatus } from '@/data/types';
import { STATUS_LABEL } from '@/lib/attendance';
import { parseISODate } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

/** Mon–Fri dots for this week; today is ringed. */
export function WeekStrip({ days, today }: { days: { date: string; label: string; status: AttendanceStatus | null }[]; today: string }) {
  const { c, statusColor } = useTheme();
  return (
    <Card onPress={() => router.push('/attendance')} accessibilityLabel="สัปดาห์นี้ ดูเวลาเรียน">
      <View style={styles.head}>
        <Text variant="label">สัปดาห์นี้</Text>
        <Text variant="label" tone="link">
          ดูทั้งหมด
        </Text>
      </View>
      <View style={styles.row}>
        {days.map((d) => {
          const isToday = d.date === today;
          const future = d.date > today;
          return (
            <View
              key={d.date}
              style={styles.col}
              accessible
              accessibilityLabel={`${d.label} ${d.status ? STATUS_LABEL[d.status] : future ? 'ยังไม่ถึง' : 'ไม่มีข้อมูล'}`}
            >
              <Text variant="caption" tone={isToday ? 'primary' : 'secondary'}>
                {d.label}
              </Text>
              <View style={[styles.ring, { borderColor: isToday ? c.text : 'transparent' }]}>
                <View
                  style={[
                    styles.dot,
                    d.status
                      ? { backgroundColor: statusColor[d.status] }
                      : { borderWidth: 1.5, borderColor: c.hairline, backgroundColor: 'transparent' },
                  ]}
                />
              </View>
              <Text variant="data" size={12} tone="secondary">
                {String(parseISODate(d.date).getDate())}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { alignItems: 'center', gap: 6, flex: 1 },
  ring: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
