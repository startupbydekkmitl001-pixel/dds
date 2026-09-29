import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** 56pt+ row: pastel icon chip, title/subtitle, trailing value, chevron when tappable. */
export function ListRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  value,
  onPress,
  chevron,
  right,
  accessibilityHint,
}: {
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  chevron?: boolean;
  right?: ReactNode;
  accessibilityHint?: string;
}) {
  const { c, feature } = useTheme();
  const showChevron = chevron ?? !!onPress;
  return (
    <PressableScale
      disabled={!onPress}
      onPress={onPress}
      haptic={onPress ? 'selection' : false}
      scaleTo={0.985}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(' ')}
      accessibilityHint={accessibilityHint}
      style={styles.row}
    >
      {icon ? (
        <View style={[styles.chip, { backgroundColor: iconBg ?? feature.attendance.fill }]}>
          <Icon icon={icon} size={18} color={iconColor ?? feature.attendance.ink} />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text variant="body">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="label" tone="secondary">
          {value}
        </Text>
      ) : null}
      {right}
      {showChevron ? <Icon icon={ChevronRight} size={18} color={c.textSecondary} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 11 },
  chip: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
});
