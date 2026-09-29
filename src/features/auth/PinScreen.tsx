import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderTrace, useShake } from '@/components/motion';
import { Button, Text } from '@/components/ui';
import { getPin } from '@/data/pinStorage';
import { useApp } from '@/data/store';
import { now } from '@/lib/clock';
import { haptic } from '@/lib/haptics';
import { checkPin, lockRemainingMs, PIN_LENGTH } from '@/lib/pin';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { PinDots } from './PinDots';
import { PinPad } from './PinPad';
import { useBiometric } from './useBiometric';

const DOTS_W = PIN_LENGTH * 16 + (PIN_LENGTH - 1) * 20 + 48;
const DOTS_H = 64;
const CLEAR_AFTER_MS = 400;

/** Spec §5.1: slow wordmark reveal, 6 dots, big keypad, shake on error, border-trace on success. */
export default function PinScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const nickname = useApp((s) => s.student.nickname);
  const gate = useApp((s) => s.pinGate);
  const setPinGate = useApp((s) => s.setPinGate);
  const unlock = useApp((s) => s.unlock);
  const { style: shakeStyle, shake } = useShake();
  const bio = useBiometric();

  const [digits, setDigits] = useState('');
  const [state, setState] = useState<'idle' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clock, setClockMs] = useState(() => now().getTime());
  const prompted = useRef(false);

  const lockMs = lockRemainingMs(gate, clock);
  const locked = lockMs > 0;

  // Tick the lockout countdown.
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setClockMs(now().getTime()), 1000);
    return () => clearInterval(id);
  }, [locked]);

  // Slow atmospheric reveal of the wordmark (Origin, 1.4s).
  const reveal = useSharedValue(0);
  useEffect(() => {
    reveal.value = withTiming(1, { duration: reduced ? dur.fast : dur.slow, easing: ease.slow });
  }, [reduced, reveal]);
  const revealStyle = useAnimatedStyle(() => ({ opacity: reveal.value, transform: [{ translateY: (1 - reveal.value) * 10 }] }));

  const succeed = useCallback(() => {
    haptic.success();
    setMessage(null);
    setState('success');
  }, []);

  const verify = useCallback(
    async (entered: string) => {
      setBusy(true);
      const actual = await getPin();
      const t = now().getTime();
      const r = checkPin(gate, entered, actual, t);
      setPinGate(r.gate);
      setClockMs(t);
      if (r.ok) {
        succeed();
        return;
      }
      haptic.error();
      shake();
      setState('error');
      setMessage(r.locked ? null : `PIN ไม่ถูกต้อง · เหลืออีก ${r.remaining} ครั้ง`);
      setTimeout(() => {
        setDigits('');
        setBusy(false);
      }, CLEAR_AFTER_MS);
    },
    [gate, setPinGate, shake, succeed],
  );

  const onDigit = (d: string) => {
    if (busy || locked || state === 'success') return;
    const next = (digits + d).slice(0, PIN_LENGTH);
    setDigits(next);
    if (state === 'error') setState('idle');
    if (next.length === PIN_LENGTH) void verify(next);
  };

  const onDelete = () => {
    if (busy || state === 'success') return;
    setDigits((s) => s.slice(0, -1));
  };

  const tryBiometric = useCallback(async () => {
    if (await bio.authenticate()) succeed();
  }, [bio, succeed]);

  // Offer Face ID once, automatically, when it's available.
  useEffect(() => {
    if (bio.available && !prompted.current && !locked) {
      prompted.current = true;
      void tryBiometric();
    }
  }, [bio.available, locked, tryBiometric]);

  const caption = locked ? `ลองใหม่ได้ในอีก ${Math.ceil(lockMs / 1000)} วินาที` : message;

  return (
    <View style={[styles.fill, { backgroundColor: c.canvas, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 12 }]}>
      <Animated.View style={[styles.head, revealStyle]}>
        <Text variant="eyebrow" tone="secondary">
          DSCHOOL · STUDENT
        </Text>
        <Text variant="display" center>
          ยินดีต้อนรับกลับ
        </Text>
        <Text variant="displayItalic" center>
          {nickname}
        </Text>
        <Text variant="body" tone="secondary" center>
          ใส่รหัส PIN 6 หลักเพื่อเข้าใช้งาน
        </Text>
      </Animated.View>

      <View style={styles.middle}>
        <Animated.View style={[styles.dotsBox, { width: DOTS_W, height: DOTS_H }, shakeStyle]}>
          <PinDots length={PIN_LENGTH} filled={digits.length} state={state} />
          {state === 'success' ? (
            <BorderTrace width={DOTS_W} height={DOTS_H} radius={32} color={c.success} mode="once" onDone={unlock} />
          ) : null}
        </Animated.View>
        <View style={styles.caption} accessibilityLiveRegion="polite">
          {caption ? (
            <Text variant="label" color={c.dangerText} center>
              {caption}
            </Text>
          ) : null}
        </View>
      </View>

      <PinPad onDigit={onDigit} onDelete={onDelete} onBiometric={bio.available ? tryBiometric : undefined} disabled={busy || locked} />

      <Button title="ลืม PIN?" variant="ghost" onPress={() => router.push('/forgot-pin')} style={styles.forgot} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  head: { alignItems: 'center', gap: 2 },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 120 },
  dotsBox: { alignItems: 'center', justifyContent: 'center' },
  caption: { minHeight: 22 },
  forgot: { marginTop: 8, alignSelf: 'center' },
});
