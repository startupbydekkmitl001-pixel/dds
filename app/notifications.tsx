import { BellOff } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { Button, EmptyState, Screen, ScreenHeader, Text } from '@/components/ui';
import { unreadCount } from '@/data/selectors';
import { useApp } from '@/data/store';
import { AlertRow } from '@/features/notifications/AlertRow';
import { toISODate } from '@/lib/clock';
import { useNow } from '@/lib/useNow';
import { useTheme } from '@/theme/ThemeProvider';

/** Spec §5.9 — alerts inbox grouped by today / earlier. */
export default function Notifications() {
  const { c } = useTheme();
  const alerts = useApp((s) => s.alerts);
  const markAllRead = useApp((s) => s.markAllRead);
  const t = useNow();
  const today = toISODate(t);
  const sections = useMemo(
    () =>
      [
        { title: 'วันนี้', items: alerts.filter((a) => toISODate(new Date(a.at)) === today) },
        { title: 'ก่อนหน้า', items: alerts.filter((a) => toISODate(new Date(a.at)) !== today) },
      ].filter((s) => s.items.length > 0),
    [alerts, today],
  );
  const unread = unreadCount(alerts);

  return (
    <Screen
      title="การแจ้งเตือน"
      back
      header={
        <ScreenHeader
          back
          title="การแจ้งเตือน"
          eyebrow={unread > 0 ? `ยังไม่อ่าน ${unread}` : 'อ่านครบแล้ว'}
          right={unread > 0 ? <Button title="อ่านทั้งหมด" variant="ghost" size="sm" onPress={markAllRead} /> : undefined}
        />
      }
    >
      {alerts.length === 0 ? (
        <EmptyState icon={BellOff} title="ไม่มีการแจ้งเตือน" body="เราจะแจ้งเมื่อมีเรื่องสำคัญ เช่น เติมเงินสำเร็จหรือใบลาได้รับอนุมัติ" />
      ) : (
        <View style={styles.stack}>
          {sections.map((s, si) => (
            <StaggerIn key={s.title} index={si}>
              <Text variant="label" tone="secondary" style={styles.head}>
                {s.title}
              </Text>
              <View style={[styles.group, { borderColor: c.hairline }]}>
                {s.items.map((a, i) => (
                  <View key={a.id} style={i > 0 ? { borderTopWidth: 1, borderTopColor: c.hairline } : null}>
                    <AlertRow alert={a} now={t} />
                  </View>
                ))}
              </View>
            </StaggerIn>
          ))}
          <Text variant="caption" tone="secondary" center>
            ปัดซ้ายที่รายการเพื่อทำเครื่องหมายว่าอ่านแล้ว
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 18 },
  head: { marginBottom: 8 },
  group: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
});
