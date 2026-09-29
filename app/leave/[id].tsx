import { useLocalSearchParams } from 'expo-router';
import { CalendarRange, FileQuestion, FileText, Hash, MessageSquareText } from 'lucide-react-native';
import { Image, StyleSheet, View } from 'react-native';
import { Card, EmptyState, ListRow, Screen, ScreenHeader, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import { LeaveBadge } from '@/features/leave/LeaveBadge';
import { LeaveTimeline } from '@/features/leave/LeaveTimeline';
import { leaveRange } from '@/features/leave/format';
import { LEAVE_TYPE_LABEL, schoolDaysBetween } from '@/lib/leave';
import { useTheme } from '@/theme/ThemeProvider';

/** Live status of one leave request. */
export default function LeaveDetail() {
  const { radius } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const leave = useApp((s) => s.leaves.find((l) => l.id === id));

  return (
    <Screen title="สถานะใบลา" back header={<ScreenHeader back title="สถานะใบลา" right={leave ? <LeaveBadge status={leave.status} /> : undefined} />}>
      {!leave ? (
        <EmptyState feature="leave" icon={FileQuestion} title="ไม่พบใบลานี้" body="ใบลาอาจถูกลบเมื่อรีเซ็ตข้อมูลเดโม" />
      ) : (
        <View style={styles.stack}>
          <Card>
            <LeaveTimeline leave={leave} />
          </Card>
          <Card padded={false}>
            <ListRow icon={FileText} title="ประเภท" value={LEAVE_TYPE_LABEL[leave.type]} chevron={false} />
            <ListRow icon={CalendarRange} title="วันที่" value={leaveRange(leave.start, leave.end)} chevron={false} />
            <ListRow icon={Hash} title="จำนวน" value={`${schoolDaysBetween(leave.start, leave.end)} วันเรียน`} chevron={false} />
            <ListRow icon={MessageSquareText} title="เหตุผล" subtitle={leave.reason} chevron={false} />
          </Card>
          {leave.photoUri ? (
            <View style={styles.photoBlock}>
              <Text variant="label" tone="secondary">
                รูปที่แนบ
              </Text>
              <Image source={{ uri: leave.photoUri }} style={[styles.photo, { borderRadius: radius.card }]} accessibilityLabel="รูปที่แนบกับใบลา" />
            </View>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  photoBlock: { gap: 8 },
  photo: { width: '100%', height: 220 },
});
