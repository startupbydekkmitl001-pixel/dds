import { useEffect, useRef, useState } from 'react';
import { Easing, Text, type StyleProp, type TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { dur } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { lineHeightFor, type TypeVariant } from '@/theme/typography';

const focusPull = Easing.bezier(0.52, 0.01, 0, 1);

/** Counts from the previous value (or `from`) to `value` over the base duration. */
export function NumberTicker({
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
  style?: StyleProp<TextStyle>;
}) {
  const { c, type } = useTheme();
  const reduced = useReducedMotion();
  const previous = useRef(from ?? value);
  const [shown, setShown] = useState(reduced ? value : previous.current);

  useEffect(() => {
    const start = previous.current;
    previous.current = value;
    if (reduced || start === value) {
      setShown(value);
      return;
    }
    let raf = 0;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / dur.base);
      setShown(start + (value - start) * focusPull(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  const base = type[variant];
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      style={[
        base,
        { color: color ?? c.text, fontVariant: ['tabular-nums'] },
        size ? { fontSize: size, lineHeight: lineHeightFor(size, base.fontFamily) } : null,
        style,
      ]}
    >
      {format(Math.round(shown))}
    </Text>
  );
}
