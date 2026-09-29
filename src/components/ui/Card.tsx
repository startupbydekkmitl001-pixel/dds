import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';
import { GlassLayers } from './Glass';

/** Frosted glass card floating on a soft shadow over the ambient light. */
export function Card({
  children,
  onPress,
  style,
  padded = true,
  tint,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** Tinted glass (e.g. a feature pastel) instead of clear frost. */
  tint?: string;
  accessibilityLabel?: string;
}) {
  const { radius, elevation } = useTheme();
  const surface: ViewStyle = {
    borderRadius: radius.card,
    padding: padded ? 18 : 0,
    boxShadow: elevation.low,
  };
  const layers = <GlassLayers radius={radius.card} tint={tint} />;
  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} style={[surface, style]}>
        {layers}
        {children}
      </PressableScale>
    );
  }
  return (
    <View style={[surface, style]}>
      {layers}
      {children}
    </View>
  );
}
