import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from '@/components/ui';
import { unreadCount } from '@/data/selectors';
import { useApp } from '@/data/store';
import { thaiDate } from '@/lib/format';
import { greetingFor } from '@/lib/greeting';

export function HomeHeader({ now }: { now: Date }) {
  const nickname = useApp((s) => s.student.nickname);
  const alerts = useApp((s) => s.alerts);
  const unread = unreadCount(alerts);

  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Text variant="eyebrow" tone="secondary">
          {thaiDate(now, 'weekdayShort')}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {greetingFor(now)}
        </Text>
        <Text variant="displayItalic">{nickname}</Text>
      </View>
      <IconButton icon={Bell} label="การแจ้งเตือน" badge={unread} onPress={() => router.push('/notifications')} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 4, paddingBottom: 18 },
  flex: { flex: 1 },
});
