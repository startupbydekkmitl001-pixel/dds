import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useReduceTransparency } from '@/lib/useReduceTransparency';
import { useTheme } from '@/theme/ThemeProvider';
import { withAlpha } from '@/theme/tokens';

/** Backdrop blur is native on iOS and CSS on web; Android gets a denser tinted fill instead. */
const CAN_BLUR = Platform.OS === 'ios' || Platform.OS === 'web';

export interface GlassMaterial {
  radius: number;
  /** Blur what's behind (chrome, sheets). Cards over the ambient light don't need it. */
  blur?: boolean;
  intensity?: number;
  /** Denser fill for surfaces that float over moving content. */
  strong?: boolean;
  /** Replace the frosted fill with a tinted one (e.g. a feature pastel). */
  tint?: string;
  /** Specular highlight from the top edge. */
  gloss?: boolean;
  /** Bright rim. */
  rim?: boolean;
}

/**
 * The glass material as absolutely-positioned layers: blur → fill → gloss → rim.
 * Drop it as the first child of any rounded container.
 */
export function GlassLayers({ radius, blur = false, intensity = 40, strong = false, tint, gloss = true, rim = true }: GlassMaterial) {
  const { c, scheme } = useTheme();
  const opaque = useReduceTransparency();
  const blurring = blur && CAN_BLUR && !opaque;
  const fill = opaque
    ? c.card
    : tint ?? (strong ? (blurring ? c.glassStrong : withAlpha(c.card, 0.94)) : c.glass);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      {blurring ? <BlurView intensity={intensity} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: fill }]} />
      {gloss && !opaque ? (
        <LinearGradient
          colors={[c.gloss, 'transparent']}
          locations={[0, 0.6]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {rim ? <View style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: 1, borderColor: c.glassBorder }]} /> : null}
    </View>
  );
}

/** A frosted, glossy pane that floats on a soft shadow. */
export function Glass({
  children,
  style,
  elevated = true,
  lift = 'low',
  ...rest
}: GlassMaterial & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  lift?: 'low' | 'high';
} & Pick<ViewProps, 'accessible' | 'accessibilityLabel' | 'accessibilityRole' | 'onLayout' | 'pointerEvents'>) {
  const { elevation } = useTheme();
  const { radius, blur, intensity, strong, tint, gloss, rim, ...viewProps } = rest;
  return (
    <View {...viewProps} style={[{ borderRadius: radius }, elevated ? { boxShadow: elevation[lift] } : null, style]}>
      <GlassLayers radius={radius} blur={blur} intensity={intensity} strong={strong} tint={tint} gloss={gloss} rim={rim} />
      {children}
    </View>
  );
}
