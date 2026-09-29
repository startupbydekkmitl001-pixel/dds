import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** 56pt+ row: icon chip, title/subtitle, trailing value, chevron when tappable. */
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
  const { c } = useTheme();
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
        <View style={[styles.chip, { backgroundColor: iconBg ?? c.pressed }]}>
          <Icon icon={icon} size={18} color={iconColor ?? c.text} />
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
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
});
