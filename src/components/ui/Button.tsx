import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/** 52pt buttons. At most one `primary` per screen. */
export function Button({
  title,
  onPress,
  variant = 'secondary',
  icon,
  loading = false,
  destructive = false,
  size = 'md',
  accessibilityHint,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  destructive?: boolean;
  size?: 'md' | 'sm';
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { c, radius } = useTheme();
  const bg =
    variant === 'primary' ? (destructive ? c.dangerText : c.primary) : variant === 'secondary' ? c.secondary : 'transparent';
  const fg =
    variant === 'primary' ? (destructive ? c.onDanger : c.onPrimary) : variant === 'secondary' ? c.onSecondary : destructive ? c.dangerText : c.text;

  return (
    <PressableScale
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading }}
      haptic={variant === 'primary' ? 'light' : false}
      onPress={loading ? undefined : onPress}
      style={[
        styles.base,
        { backgroundColor: bg, borderRadius: radius.button, height: size === 'md' ? 52 : 40, paddingHorizontal: size === 'md' ? 20 : 14 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon icon={icon} size={size === 'md' ? 20 : 18} color={fg} /> : null}
          <Text variant="label" color={fg} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
