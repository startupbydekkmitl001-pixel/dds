import { router, type Href } from 'expo-router';
import { CheckCheck } from 'lucide-react-native';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { PressableScale } from '@/components/motion';
import { FEATURE_ICON, Icon, Text } from '@/components/ui';
import { useApp } from '@/data/store';
import type { AlertKind, AppAlert, FeatureKey } from '@/data/types';
import { relativeTime } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

const KIND_FEATURE: Record<AlertKind, FeatureKey> = {
  topup: 'wallet',
  leave: 'leave',
  announcement: 'announcements',
  attendance: 'attendance',
  behavior: 'behavior',
};

/** Inbox row: feature-coloured chip, unread dot; swipe left to mark read, tap to open. */
export function AlertRow({ alert, now }: { alert: AppAlert; now: Date }) {
  const { c, feature } = useTheme();
  const markRead = useApp((s) => s.markRead);
  const ref = useRef<SwipeableMethods>(null);
  const f = feature[KIND_FEATURE[alert.kind]];

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={2}
      rightThreshold={56}
      overshootRight={false}
      renderRightActions={() => (
        <View style={[styles.action, { backgroundColor: c.success }]}>
          <Icon icon={CheckCheck} size={20} color={c.canvas} />
          <Text variant="caption" color={c.canvas}>
            อ่านแล้ว
          </Text>
        </View>
      )}
      onSwipeableOpen={() => {
        markRead(alert.id);
        ref.current?.close();
      }}
    >
      <PressableScale
        scaleTo={0.985}
        accessibilityLabel={`${alert.read ? '' : 'ยังไม่อ่าน '}${alert.title} ${alert.body} ${relativeTime(new Date(alert.at), now)}`}
        accessibilityHint="แตะเพื่อเปิด ปัดซ้ายเพื่อทำเครื่องหมายว่าอ่านแล้ว"
        onPress={() => {
          markRead(alert.id);
          router.push(alert.link as Href);
        }}
        style={[styles.row, { backgroundColor: c.card }]}
      >
        <View style={[styles.chip, { backgroundColor: f.fill }]}>
          <Icon icon={FEATURE_ICON[KIND_FEATURE[alert.kind]]} size={18} color={f.ink} />
        </View>
        <View style={styles.flex}>
          <Text variant="label" numberOfLines={1}>
            {alert.title}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {alert.body}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text variant="caption" tone="secondary">
            {relativeTime(new Date(alert.at), now)}
          </Text>
          <View style={[styles.dot, { backgroundColor: alert.read ? 'transparent' : c.primary }]} />
        </View>
      </PressableScale>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  chip: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  meta: { alignItems: 'flex-end', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  action: { width: 96, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
