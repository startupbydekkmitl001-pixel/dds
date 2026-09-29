import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** Pill choice. `lg` is the 56pt full-width answer pill used in assessments. */
export function Chip({
  label,
  selected = false,
  onPress,
  size = 'md',
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'md' | 'lg';
  icon?: LucideIcon;
}) {
  const { c, radius } = useTheme();
  const fg = selected ? c.onPrimary : c.text;
  return (
    <PressableScale
      haptic="selection"
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: radius.chip,
        backgroundColor: selected ? c.primary : c.card,
        borderWidth: 1,
        borderColor: selected ? c.primary : c.hairline,
        minHeight: size === 'lg' ? 56 : 40,
        paddingHorizontal: size === 'lg' ? 20 : 16,
        alignSelf: size === 'lg' ? 'stretch' : 'flex-start',
      }}
    >
      {icon ? <Icon icon={icon} size={16} color={fg} /> : null}
      <Text variant={size === 'lg' ? 'body' : 'label'} color={fg}>
        {label}
      </Text>
    </PressableScale>
  );
}
