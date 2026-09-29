import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/theme/ThemeProvider';

/** Flat white card on parchment (graphite in dark mode); a hairline, never a shadow. */
export function Card({
  children,
  onPress,
  style,
  padded = true,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  accessibilityLabel?: string;
}) {
  const { c, radius } = useTheme();
  const surface: ViewStyle = {
    backgroundColor: c.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: c.hairline,
    padding: padded ? 16 : 0,
  };
  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} style={[surface, style]}>
        {children}
      </PressableScale>
    );
  }
  return <View style={[surface, style]}>{children}</View>;
}
