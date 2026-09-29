import { router } from 'expo-router';
import { ChevronRight, Megaphone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/motion';
import { Icon, Text } from '@/components/ui';
import type { Announcement } from '@/data/types';
import { relativeTime } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

/** Superhuman's deep-lagoon band, used for school announcements. */
export function AnnouncementBand({ items, now }: { items: Announcement[]; now: Date }) {
  const { feature, radius } = useTheme();
  const { fill, ink } = feature.announcements;
  return (
    <View style={[styles.band, { backgroundColor: fill, borderRadius: radius.tile }]}>
      <View style={styles.head}>
        <Icon icon={Megaphone} size={20} color={ink} />
        <Text variant="label" color={ink} style={styles.flex}>
          ประกาศจากโรงเรียน
        </Text>
        <PressableScale accessibilityLabel="ดูประกาศทั้งหมด" onPress={() => router.push('/notifications')} hitSlop={8}>
          <Text variant="label" color={ink} style={styles.underline}>
            ดูทั้งหมด
          </Text>
        </PressableScale>
      </View>
      {items.map((a, i) => (
        <PressableScale
          key={a.id}
          onPress={() => router.push(`/announcement/${a.id}`)}
          accessibilityLabel={`${a.category} ${a.title}`}
          style={[styles.item, i > 0 ? { borderTopWidth: 1, borderTopColor: withAlpha(ink, 0.16) } : null]}
        >
          <View style={styles.flex}>
            <Text variant="caption" color={ink}>
              {`${a.category} · ${relativeTime(new Date(a.at), now)}`}
            </Text>
            <Text variant="body" color={ink}>
              {a.title}
            </Text>
          </View>
          <Icon icon={ChevronRight} size={18} color={ink} />
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { padding: 20, gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  flex: { flex: 1 },
  underline: { textDecorationLine: 'underline' },
});
