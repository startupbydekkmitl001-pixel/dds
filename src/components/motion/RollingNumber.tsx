import { useEffect } from 'react';
import { PixelRatio, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { lineHeightFor, type TypeVariant } from '@/theme/typography';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function DigitColumn({
  digit,
  start,
  lh,
  textStyle,
  delay,
}: {
  digit: number;
  start: number;
  lh: number;
  textStyle: object;
  delay: number;
}) {
  const reduced = useReducedMotion();
  const pos = useSharedValue(reduced ? digit : start);

  useEffect(() => {
    pos.value = reduced ? digit : withDelay(delay, withTiming(digit, { duration: dur.base * 2, easing: ease.out }));
  }, [digit, delay, reduced, pos]);

  const strip = useAnimatedStyle(() => ({ transform: [{ translateY: -pos.value * lh }] }));

  return (
    <View style={{ height: lh, overflow: 'hidden' }}>
      <Animated.View style={strip}>
        {DIGITS.map((d) => (
          <Text key={d} allowFontScaling={false} style={[textStyle, { height: lh }]}>
            {d}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

/**
 * Odometer: each digit rolls on its own strip to the new value, cascading left
 * to right. Punctuation and currency stay put. Instant under Reduce Motion.
 */
export function RollingNumber({
  value,
  format,
  variant = 'data',
  size,
  color,
  from,
  style,
}: {
  value: number;
  format: (n: number) => string;
  variant?: TypeVariant;
  size?: number;
  color?: string;
  from?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { c, type } = useTheme();
  const base = type[variant];
  // Strips clip to an exact line height, so apply Dynamic Type ourselves (capped like other large numbers).
  const scale = Math.min(PixelRatio.getFontScale(), 1.4);
  const fontSize = (size ?? base.fontSize) * scale;
  const lh = lineHeightFor(fontSize, base.fontFamily);
  const textStyle = { ...base, fontSize, lineHeight: lh, color: color ?? c.text, fontVariant: ['tabular-nums' as const] };

  const text = format(value);
  // A column rolls from its current digit whenever the value changes; this only seeds columns as they
  // mount (the first render, or a new leading digit), aligned from the right.
  const seed = format(from ?? value);

  const chars = text.split('');
  let digitIndex = 0;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={text}
      style={[styles.row, style]}
    >
      <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {chars.map((ch, i) => {
          const fromRight = chars.length - i;
          if (!/\d/.test(ch)) {
            return (
              <Text key={`s${fromRight}`} allowFontScaling={false} style={[textStyle, { height: lh }]}>
                {ch}
              </Text>
            );
          }
          const prevCh = seed[seed.length - fromRight];
          const start = prevCh && /\d/.test(prevCh) ? Number(prevCh) : 0;
          const delay = digitIndex++ * 45;
          return <DigitColumn key={`d${fromRight}`} digit={Number(ch)} start={start} lh={lh} textStyle={textStyle} delay={delay} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
});
