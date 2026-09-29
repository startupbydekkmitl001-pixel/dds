import { router } from 'expo-router';
import { ChevronRight, Megaphone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Aurora, PressableScale } from '@/components/motion';
import { GlassLayers, Icon, Text } from '@/components/ui';
import type { Announcement } from '@/data/types';
import { relativeTime } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

/** School announcements on lagoon-tinted glass. */
export function AnnouncementBand({ items, now }: { items: Announcement[]; now: Date }) {
  const { c, feature, radius, elevation } = useTheme();
  const f = feature.announcements;
  return (
    <View style={[styles.band, { borderRadius: radius.tile, boxShadow: elevation.low }]}>
      <GlassLayers radius={radius.tile} gloss={false} />
      <Aurora
        drift={false}
        style={{ borderRadius: radius.tile }}
        orbs={[
          // Kept faint and off the header row so every line of text stays AA on the tint.
          { color: f.glow, x: 1.05, y: 0.62, r: 0.42, opacity: 0.3 },
          { color: feature.behavior.glow, x: -0.05, y: 1.05, r: 0.36, opacity: 0.22 },
        ]}
      />
      <GlassLayers radius={radius.tile} tint="transparent" />
      <View style={styles.head}>
        <View style={[styles.chip, { backgroundColor: f.fill }]}>
          <Icon icon={Megaphone} size={17} color={f.ink} />
        </View>
        <Text variant="label" style={styles.flex}>
          ประกาศจากโรงเรียน
        </Text>
        <PressableScale accessibilityLabel="ดูประกาศทั้งหมด" onPress={() => router.push('/notifications')} hitSlop={8}>
          <Text variant="label" tone="link">
            ดูทั้งหมด
          </Text>
        </PressableScale>
      </View>
      {items.map((a, i) => (
        <PressableScale
          key={a.id}
          onPress={() => router.push(`/announcement/${a.id}`)}
          accessibilityLabel={`${a.category} ${a.title}`}
          style={[styles.item, i > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.hairline } : null]}
        >
          <View style={styles.flex}>
            <Text variant="caption" tone="secondary">
              {`${a.category} · ${relativeTime(new Date(a.at), now)}`}
            </Text>
            <Text variant="body">{a.title}</Text>
          </View>
          <Icon icon={ChevronRight} size={18} color={c.textSecondary} />
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { padding: 18, gap: 2 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  chip: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  flex: { flex: 1 },
});
