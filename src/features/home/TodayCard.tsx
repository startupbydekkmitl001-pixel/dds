import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from '@/components/ui';
import type { TodayInfo } from '@/data/selectors';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';
import { Journey } from './Journey';

/** Status pill: the dot carries the colour, the label stays ink for contrast. */
function Pill({ label, color }: { label: string; color: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: withAlpha(color, 0.16), borderColor: c.glassBorder }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="label">{label}</Text>
    </View>
  );
}

/** Today at a glance: did I check in, am I late, am I on leave — told as a short journey. */
export function TodayCard({ info }: { info: TodayInfo }) {
  const { c, statusColor } = useTheme();

  let title: string;
  let detail: string;
  let pill: { label: string; color: string };
  let journey: { progress: number; endLabel?: string; waiting?: boolean };
  switch (info.kind) {
    case 'arrived':
      title = `ถึงโรงเรียน ${info.checkIn}`;
      detail = 'สแกนเข้าที่ประตู 1';
      pill = info.onTime ? { label: 'ตรงเวลา', color: statusColor.present } : { label: 'มาสาย', color: statusColor.late };
      journey = { progress: 1, endLabel: info.checkIn };
      break;
    case 'notYet':
      title = 'ยังไม่ลงเวลา';
      detail = `ประตูปิด ${info.gateClose} · สแกนบัตรที่ประตูโรงเรียน`;
      pill = { label: 'รอสแกน', color: statusColor.late };
      journey = { progress: 0.55, endLabel: `ปิด ${info.gateClose}`, waiting: true };
      break;
    case 'onLeave':
      title = info.leaveType === 'sick' ? 'วันนี้ลาป่วย' : 'วันนี้ลากิจ';
      detail = 'ใบลาได้รับการอนุมัติแล้ว พักผ่อนให้เต็มที่';
      pill = { label: info.leaveType === 'sick' ? 'ลาป่วย' : 'ลากิจ', color: statusColor[info.leaveType] };
      journey = { progress: 0 };
      break;
    default:
      title = 'วันนี้ไม่มีเรียน';
      detail = 'วันหยุด พักผ่อนให้เต็มที่แล้วเจอกันวันเปิดเรียน';
      pill = { label: 'วันหยุด', color: c.textSecondary };
      journey = { progress: 0 };
  }

  return (
    <Card onPress={() => router.push('/attendance')} accessibilityLabel={`วันนี้ ${title} ${pill.label}`} style={styles.card}>
      <View style={styles.top}>
        <Text variant="label" tone="secondary">
          วันนี้
        </Text>
        <Pill label={pill.label} color={pill.color} />
      </View>
      <Text variant="heading">{title}</Text>
      <Text variant="caption" tone="secondary">
        {detail}
      </Text>
      <Journey progress={journey.progress} color={pill.color} endLabel={journey.endLabel} waiting={journey.waiting} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
