import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { white, withAlpha } from '@/theme/tokens';
import { GlassLayers } from './Glass';
import { Icon, type LucideIcon } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Pill buttons. `primary` is glossy ink (at most one per screen), `secondary`
 * is frosted glass, `ghost` is text only.
 */
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
  const { c, radius, elevation } = useTheme();
  const primary = variant === 'primary';
  const bg = primary ? (destructive ? c.dangerText : c.primary) : 'transparent';
  const fg = primary ? (destructive ? c.onDanger : c.onPrimary) : destructive ? c.dangerText : c.text;
  const h = size === 'md' ? 52 : 40;

  return (
    <PressableScale
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading }}
      haptic={primary ? 'light' : false}
      onPress={loading ? undefined : onPress}
      style={[
        styles.base,
        { backgroundColor: bg, borderRadius: radius.button, height: h, paddingHorizontal: size === 'md' ? 22 : 16 },
        primary || variant === 'secondary' ? { boxShadow: elevation.low } : null,
        style,
      ]}
    >
      {primary ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: h / 2, overflow: 'hidden' }]}>
          <LinearGradient colors={[withAlpha(white, 0.22), withAlpha(white, 0)]} locations={[0, 0.55]} style={StyleSheet.absoluteFill} />
        </View>
      ) : variant === 'secondary' ? (
        <GlassLayers radius={h / 2} />
      ) : null}
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
