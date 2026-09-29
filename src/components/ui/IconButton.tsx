import { View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { GlassLayers } from './Glass';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** 44pt round glass icon button with an accessible label and optional count badge. */
export function IconButton({
  icon,
  label,
  onPress,
  badge,
  tone = 'card',
  color,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  badge?: number;
  tone?: 'card' | 'plain';
  color?: string;
}) {
  const { c, elevation } = useTheme();
  return (
    <PressableScale
      accessibilityLabel={badge ? `${label} ${badge} รายการใหม่` : label}
      haptic="selection"
      onPress={onPress}
      hitSlop={6}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: tone === 'card' ? elevation.low : undefined,
      }}
    >
      {tone === 'card' ? <GlassLayers radius={22} /> : null}
      <Icon icon={icon} size={20} color={color} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            paddingHorizontal: 5,
            backgroundColor: c.primary,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: c.canvas,
          }}
        >
          <Text variant="data" size={10} color={c.onPrimary}>
            {badge > 9 ? '9+' : String(badge)}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}
