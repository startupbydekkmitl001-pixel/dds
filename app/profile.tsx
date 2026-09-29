import * as Clipboard from 'expo-clipboard';
import { Copy, GraduationCap, Hash, Phone, School, UserRound, Users } from 'lucide-react-native';
import { Linking, StyleSheet, View } from 'react-native';
import { Card, IconButton, ListRow, Screen, ScreenHeader, toast, type LucideIcon } from '@/components/ui';
import { useApp } from '@/data/store';
import { haptic } from '@/lib/haptics';
import { MonogramAvatar } from '@/features/me/MonogramAvatar';

const MISSING = 'ยังไม่มีข้อมูล · ติดต่อฝ่ายทะเบียน';

/** Spec §5.10 — profile with copy/call actions; missing values say what to do instead of "-". */
export default function Profile() {
  const student = useApp((s) => s.student);

  const copy = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    haptic.success();
    toast(`คัดลอก${label}แล้ว`, { kind: 'success' });
  };

  const row = (icon: LucideIcon, title: string, value: string | null, action?: 'copy' | 'call') => (
    <ListRow
      icon={icon}
      title={title}
      subtitle={value ?? MISSING}
      chevron={false}
      right={
        value && action === 'call' ? (
          <IconButton icon={Phone} label={`โทร ${title}`} onPress={() => Linking.openURL(`tel:${value.replace(/-/g, '')}`)} />
        ) : value && action === 'copy' ? (
          <IconButton icon={Copy} label={`คัดลอก${title}`} onPress={() => copy(title, value)} />
        ) : undefined
      }
    />
  );

  return (
    <Screen title="ข้อมูลส่วนตัว" back header={<ScreenHeader back title="ข้อมูลส่วนตัว" />}>
      <View style={styles.avatar}>
        <MonogramAvatar name={student.firstName} size={88} />
      </View>
      <Card padded={false}>
        {row(UserRound, 'ชื่อ-นามสกุล', `${student.firstName} ${student.lastName}`)}
        {row(Hash, 'รหัสนักเรียน', student.id, 'copy')}
        {row(GraduationCap, 'ชั้น', student.classroom)}
        {row(School, 'โรงเรียน', student.school)}
        {row(Phone, 'เบอร์โทรนักเรียน', student.phone, 'call')}
      </Card>
      <View style={styles.gap} />
      <Card padded={false}>
        {row(Users, 'ผู้ปกครอง', student.guardianName)}
        {row(Phone, 'เบอร์โทรผู้ปกครอง', student.guardianPhone, 'call')}
        {row(UserRound, 'ครูที่ปรึกษา', student.advisor.name)}
        {row(Phone, 'เบอร์โทรครูที่ปรึกษา', student.advisor.phone, 'call')}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', marginBottom: 20 },
  gap: { height: 12 },
});
