import { View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

/** 44pt round icon button with an accessible label and optional count badge. */
export function IconButton({
  icon,
  label,
  onPress,
  badge,
  tone = 'card',
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  badge?: number;
  tone?: 'card' | 'plain';
}) {
  const { c } = useTheme();
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
        backgroundColor: tone === 'card' ? c.card : 'transparent',
        borderWidth: tone === 'card' ? 1 : 0,
        borderColor: c.hairline,
      }}
    >
      <Icon icon={icon} size={20} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
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
