import { router, useLocalSearchParams } from 'expo-router';
import { CalendarX, DoorOpen, LogIn, StickyNote, X } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, EmptyState, IconButton, ListRow, Text } from '@/components/ui';
import { semesterDays } from '@/data/selectors';
import { useApp } from '@/data/store';
import { currentSemesterId, STATUS_LABEL } from '@/lib/attendance';
import { now } from '@/lib/clock';
import { parseISODate, thaiDate } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

/** Day detail sheet: status, check-in time, gate, and any leave note. */
export default function DaySheet() {
  const { c, statusColor } = useTheme();
  const insets = useSafeAreaInsets();
  const { date } = useLocalSearchParams<{ date: string }>();
  const attendance = useApp((s) => s.attendance);
  const leaves = useApp((s) => s.leaves);
  const demo = useApp((s) => s.settings.demo);
  const day = useMemo(
    () => (date ? semesterDays({ leaves, attendance }, currentSemesterId(date), demo, now()).find((d) => d.date === date) : undefined),
    [date, leaves, attendance, demo],
  );

  return (
    <ScrollView style={{ backgroundColor: c.canvas }} contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.top}>
        <Text variant="title" accessibilityRole="header" style={styles.flex}>
          {date ? thaiDate(parseISODate(date), 'long') : ''}
        </Text>
        <IconButton icon={X} label="ปิด" onPress={() => router.back()} />
      </View>
      {!day ? (
        <EmptyState icon={CalendarX} title="ไม่มีข้อมูลวันนี้" body="วันนี้อาจเป็นวันหยุดหรือยังไม่ถึง" />
      ) : (
        <>
          <View style={[styles.pill, { backgroundColor: withAlpha(statusColor[day.status], 0.16) }]}>
            <View style={[styles.dot, { backgroundColor: statusColor[day.status] }]} />
            <Text variant="heading">{STATUS_LABEL[day.status]}</Text>
          </View>
          <Card padded={false}>
            <ListRow icon={LogIn} title="เวลาเข้า" value={day.checkIn ?? '—'} chevron={false} />
            <ListRow icon={DoorOpen} title="ประตู" value={day.gate ?? '—'} chevron={false} />
            {day.note ? <ListRow icon={StickyNote} title="หมายเหตุ" subtitle={day.note} chevron={false} /> : null}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, gap: 16 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
