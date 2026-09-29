import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion/StaggerIn';
import type { FeatureKey } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** An invitation, not an apology: feature-coloured icon, one line, and a next step. */
export function EmptyState({
  feature: key,
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  feature?: FeatureKey;
  icon: LucideIcon;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { c, feature } = useTheme();
  const fill = key ? feature[key].fill : c.hairline;
  const ink = key ? feature[key].ink : c.textSecondary;
  return (
    <StaggerIn style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: fill }]}>
        <Icon icon={icon} color={ink} size={28} />
      </View>
      <Text variant="heading" center>
        {title}
      </Text>
      {body ? (
        <Text variant="body" tone="secondary" center>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="secondary" style={styles.action} /> : null}
    </StaggerIn>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 10 },
  badge: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  action: { marginTop: 8, alignSelf: 'stretch' },
});
