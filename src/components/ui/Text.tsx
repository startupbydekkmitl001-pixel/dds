import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { lineHeightFor, type TypeVariant } from '@/theme/typography';

export type Tone = 'primary' | 'secondary' | 'link' | 'onPrimary' | 'inherit';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  color?: string;
  /** Override font size; line height follows at 1.25×. */
  size?: number;
  center?: boolean;
};

const THAI = /[฀-๿]/;
const LARGE = new Set<TypeVariant>(['display', 'displayItalic', 'title']);

/** Themed text. Mono variants fall back to Plex Sans Thai when the string has Thai (the mono has no Thai glyphs). */
export function Text({ variant = 'body', tone = 'primary', color, size, center, style, maxFontSizeMultiplier, children, ...rest }: TextProps) {
  const { c, type } = useTheme();
  const base = type[variant];
  const toneColor =
    tone === 'inherit'
      ? undefined
      : tone === 'secondary'
        ? c.textSecondary
        : tone === 'link'
          ? c.link
          : tone === 'onPrimary'
            ? c.onPrimary
            : c.text;
  const isMono = variant === 'data' || variant === 'eyebrow';
  const thaiInMono = isMono && typeof children === 'string' && THAI.test(children);

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? (LARGE.has(variant) ? 1.4 : 1.8)}
      style={[
        base,
        thaiInMono ? { fontFamily: 'IBMPlexSansThai_500Medium', letterSpacing: variant === 'eyebrow' ? 0.4 : 0 } : null,
        toneColor ? { color: toneColor } : null,
        color ? { color } : null,
        size ? { fontSize: size, lineHeight: lineHeightFor(size) } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
