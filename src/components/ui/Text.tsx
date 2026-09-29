import type { ReactNode } from 'react';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ITALIC_OVERHANG, lineHeightFor, type TypeVariant } from '@/theme/typography';

export type Tone = 'primary' | 'secondary' | 'link' | 'onPrimary' | 'inherit';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  color?: string;
  /** Override font size; line height follows the font (see `lineHeightFor`). */
  size?: number;
  center?: boolean;
};

const THAI = /[฀-๿]/;
const LARGE = new Set<TypeVariant>(['display', 'displayItalic', 'title']);

/** The text of plain string/number children, or null when they include elements. */
function plainText(children: ReactNode): string | null {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children) && children.every((ch) => typeof ch === 'string' || typeof ch === 'number')) return children.join('');
  return null;
}

/**
 * Themed text. Mono variants fall back to Plex Sans Thai when the string has Thai (the mono has no Thai
 * glyphs). Whatever the variant, size or style override, a line is never shorter than its font needs, so
 * Thai marks are never clipped, and italic gets room at the sides for the letters that lean past its box.
 */
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
  const text = plainText(children);
  const thai = text !== null && THAI.test(text);

  const composed = [
    base,
    thai && isMono ? { fontFamily: 'IBMPlexSansThai_500Medium', letterSpacing: variant === 'eyebrow' ? 0.4 : 0 } : null,
    // Thai isn't tracked: tightening it crowds the marks stacked over neighbouring letters.
    thai && !isMono && base.letterSpacing ? { letterSpacing: 0 } : null,
    toneColor ? { color: toneColor } : null,
    color ? { color } : null,
    size ? { fontSize: size } : null,
    center ? { textAlign: 'center' as const } : null,
    style,
  ];
  const flat: TextStyle = StyleSheet.flatten(composed);
  const fontSize = flat.fontSize ?? base.fontSize;
  const fits = lineHeightFor(fontSize, flat.fontFamily);
  // A size override takes the line height of its font; the variant's (or a style's) is only kept when taller.
  const asked = size && StyleSheet.flatten(style)?.lineHeight === undefined ? 0 : (flat.lineHeight ?? 0);
  const lean = flat.fontFamily?.endsWith('_Italic') ? Math.ceil(fontSize * ITALIC_OVERHANG) : 0;

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? (LARGE.has(variant) ? 1.4 : 1.8)}
      style={[
        composed,
        { lineHeight: Math.max(asked, fits) },
        // Padding the box and pulling it back by the same margin leaves the layout where it was.
        lean ? { paddingHorizontal: lean, marginHorizontal: -lean } : null,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
