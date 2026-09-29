import { StyleSheet, View } from 'react-native';
import { GlossOrb } from '@/components/motion/GlossOrb';
import { StaggerIn } from '@/components/motion/StaggerIn';
import type { FeatureKey } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** An invitation, not an apology: a floating pastel orb carrying the icon, one line, and a next step. */
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
  const f = key ? feature[key] : { fill: c.secondary, ink: c.text, glow: c.accent };
  return (
    <StaggerIn style={styles.wrap}>
      <View style={styles.badge}>
        <GlossOrb size={72} color={f.fill} deep={f.glow} />
        <View style={[StyleSheet.absoluteFill, styles.icon]} pointerEvents="none">
          <Icon icon={icon} color={f.ink} size={26} />
        </View>
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
  badge: { width: 72, height: 85, marginBottom: 4 },
  icon: { height: 72, alignItems: 'center', justifyContent: 'center' },
  action: { marginTop: 8, alignSelf: 'stretch' },
});
