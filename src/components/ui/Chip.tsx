import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { GlassLayers } from './Glass';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** Glass pill choice; selected fills with ink. `lg` is the 56pt full-width answer pill used in assessments. */
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
  const { c, radius, elevation } = useTheme();
  const fg = selected ? c.onPrimary : c.text;
  const h = size === 'lg' ? 56 : 40;
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
        backgroundColor: selected ? c.primary : 'transparent',
        boxShadow: selected ? elevation.low : undefined,
        minHeight: h,
        paddingHorizontal: size === 'lg' ? 22 : 16,
        alignSelf: size === 'lg' ? 'stretch' : 'flex-start',
      }}
    >
      {selected ? null : <GlassLayers radius={h / 2} />}
      {icon ? <Icon icon={icon} size={16} color={fg} /> : null}
      <Text variant={size === 'lg' ? 'body' : 'label'} color={fg}>
        {label}
      </Text>
    </PressableScale>
  );
}
