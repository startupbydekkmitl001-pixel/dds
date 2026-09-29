import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Copy, Phone, UserRound, X } from 'lucide-react-native';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, IconButton, ListRow, Text, toast } from '@/components/ui';
import { useApp } from '@/data/store';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';

const STEPS = ['ติดต่อครูที่ปรึกษาหรือฝ่ายทะเบียน', 'แจ้งรหัสนักเรียนและหมายเลขอุปกรณ์', 'รับ PIN ใหม่แล้วเข้าสู่ระบบ'];

/** Spec §5.1 forgot-PIN sheet: clear steps, advisor contact, device ID with copy. */
export default function ForgotPinSheet() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const student = useApp((s) => s.student);

  const copyDeviceId = async () => {
    await Clipboard.setStringAsync(student.deviceId);
    haptic.success();
    toast('คัดลอกแล้ว', { kind: 'success' });
  };

  return (
    <ScrollView style={{ backgroundColor: c.canvas }} contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.top}>
        <Text variant="title" accessibilityRole="header">
          ลืม PIN?
        </Text>
        <IconButton icon={X} label="ปิด" onPress={() => router.back()} />
      </View>
      <Text variant="body" tone="secondary">
        ไม่ต้องกังวล ทำตาม 3 ขั้นตอนนี้เพื่อรับ PIN ใหม่
      </Text>

      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.step}>
            <View style={[styles.num, { backgroundColor: c.secondary }]}>
              <Text variant="data" color={c.onSecondary}>
                {String(i + 1)}
              </Text>
            </View>
            <Text variant="body" style={styles.flex}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      <Card padded={false}>
        <ListRow
          icon={UserRound}
          title={student.advisor.name}
          subtitle="ครูที่ปรึกษา"
          right={
            student.advisor.phone ? (
              <IconButton icon={Phone} label={`โทรหา ${student.advisor.name}`} onPress={() => Linking.openURL(`tel:${student.advisor.phone}`)} />
            ) : undefined
          }
          chevron={false}
        />
        <ListRow
          title={student.deviceId}
          subtitle="หมายเลขอุปกรณ์"
          right={<IconButton icon={Copy} label="คัดลอกหมายเลขอุปกรณ์" onPress={copyDeviceId} />}
          chevron={false}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, gap: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  steps: { gap: 12, marginVertical: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
