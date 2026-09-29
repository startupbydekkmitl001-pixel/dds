import { router } from 'expo-router';
import { CalendarCheck, CirclePlay, Database, FileText, Info, LogOut, Megaphone, ScanFace, ShieldCheck, Wallet } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { Button, Card, ConfirmSheet, ListRow, Screen, ScreenHeader, Text, Toggle, type LucideIcon } from '@/components/ui';
import { useApp } from '@/data/store';
import type { AlertKind, FeatureKey } from '@/data/types';
import { AppearancePicker } from '@/features/settings/AppearancePicker';
import { useTheme } from '@/theme/ThemeProvider';

const NOTIFY: { kind: AlertKind; label: string; icon: LucideIcon; feature: FeatureKey }[] = [
  { kind: 'topup', label: 'เติมเงิน', icon: Wallet, feature: 'wallet' },
  { kind: 'leave', label: 'ใบลา', icon: FileText, feature: 'leave' },
  { kind: 'announcement', label: 'ประกาศ', icon: Megaphone, feature: 'announcements' },
  { kind: 'attendance', label: 'เวลาเรียน', icon: CalendarCheck, feature: 'attendance' },
  { kind: 'behavior', label: 'พฤติกรรม', icon: ShieldCheck, feature: 'behavior' },
];

function Section({ title, children, index }: { title: string; children: ReactNode; index: number }) {
  return (
    <StaggerIn index={index} style={styles.section}>
      <Text variant="label" tone="secondary" accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </StaggerIn>
  );
}

/** Spec §5.10 — appearance first, then security, alerts and sign-out. */
export default function SettingsScreen() {
  const { feature } = useTheme();
  const settings = useApp((s) => s.settings);
  const updateSettings = useApp((s) => s.updateSettings);
  const lock = useApp((s) => s.lock);
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <Screen title="ตั้งค่า" back header={<ScreenHeader back eyebrow="ฉัน" title="ตั้งค่า" />}>
      <Section title="การแสดงผล" index={0}>
        <AppearancePicker />
      </Section>

      <Section title="ความปลอดภัย" index={1}>
        <Card padded={false}>
          <ListRow
            icon={ScanFace}
            title="เข้าสู่ระบบด้วย Face ID"
            subtitle="ใช้ได้ในแอปที่ติดตั้งจริง ไม่รองรับใน Expo Go"
            chevron={false}
            right={<Toggle label="เข้าสู่ระบบด้วย Face ID" value={settings.faceId} onChange={(v) => updateSettings({ faceId: v })} />}
          />
        </Card>
      </Section>

      <Section title="การแจ้งเตือนในแอป" index={2}>
        <Card padded={false}>
          {NOTIFY.map((n) => (
            <ListRow
              key={n.kind}
              icon={n.icon}
              iconBg={feature[n.feature].fill}
              iconColor={feature[n.feature].ink}
              title={n.label}
              chevron={false}
              right={
                <Toggle
                  label={`แจ้งเตือน${n.label}`}
                  value={settings.notify[n.kind]}
                  onChange={(v) => updateSettings({ notify: { ...settings.notify, [n.kind]: v } })}
                />
              }
            />
          ))}
        </Card>
      </Section>

      <Section title="เกี่ยวกับ" index={3}>
        <Card padded={false}>
          <ListRow icon={CirclePlay} title="แนะนำแอป" subtitle="ดูวิดีโอแนะนำ Dschool อีกครั้ง" onPress={() => router.push('/intro')} />
          <ListRow icon={Info} title="Dschool" value="เวอร์ชัน 1.0.0 (เดโม)" chevron={false} />
          <ListRow icon={Database} title="ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่าง" subtitle="ไม่มีการชำระเงินหรือส่งข้อมูลจริง" chevron={false} />
        </Card>
      </Section>

      <StaggerIn index={4}>
        <Button title="ออกจากระบบ" variant="ghost" destructive icon={LogOut} onPress={() => setConfirmLogout(true)} style={styles.logout} />
      </StaggerIn>

      <View style={styles.end} />

      <ConfirmSheet
        visible={confirmLogout}
        title="ออกจากระบบ?"
        body="ครั้งหน้าใส่ PIN หรือใช้ Face ID เพื่อเข้าใช้งานอีกครั้ง ข้อมูลในเครื่องยังอยู่ครบ"
        confirmLabel="ออกจากระบบ"
        destructive
        onConfirm={() => {
          setConfirmLogout(false);
          lock();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  sectionTitle: { marginBottom: 10, marginLeft: 4 },
  logout: { alignSelf: 'center' },
  end: { height: 12 },
});
