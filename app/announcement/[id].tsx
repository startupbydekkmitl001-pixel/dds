import { router, useLocalSearchParams } from 'expo-router';
import { FileQuestion, Megaphone, X } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, Icon, IconButton, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import { thaiDate, timeHM } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

/** Announcement detail sheet. */
export default function AnnouncementSheet() {
  const { c, feature } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useApp((s) => s.announcements.find((a) => a.id === id));

  return (
    <ScrollView style={{ backgroundColor: c.canvas }} contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: feature.announcements.fill }]}>
          <Icon icon={Megaphone} size={20} color={feature.announcements.ink} />
        </View>
        <IconButton icon={X} label="ปิด" onPress={() => router.back()} />
      </View>
      {!item ? (
        <EmptyState icon={FileQuestion} title="ไม่พบประกาศนี้" />
      ) : (
        <>
          <Text variant="eyebrow" tone="secondary">
            {item.category}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {item.title}
          </Text>
          <Text variant="caption" tone="secondary">
            {`${thaiDate(new Date(item.at), 'long')} · ${timeHM(new Date(item.at))} น.`}
          </Text>
          <View style={[styles.rule, { backgroundColor: c.hairline }]} />
          <Text variant="body">{item.body}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, gap: 8 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rule: { height: 1, marginVertical: 12 },
});
