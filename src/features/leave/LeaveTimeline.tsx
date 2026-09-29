import { Check } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Icon, Text } from '@/components/ui';
import type { LeaveRequest } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { thaiDate, timeHM } from '@/lib/format';
import { LEAVE_STEP_LABEL, LEAVE_STEPS } from '@/lib/leave';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

type StepKey = keyof typeof LEAVE_STEP_LABEL;

function DoneDot() {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const s = useSharedValue(reduced ? 1 : 0.4);
  useEffect(() => {
    s.value = withTiming(1, { duration: dur.base, easing: ease.base });
  }, [s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: s.value }));
  return (
    <Animated.View style={[styles.dot, { backgroundColor: c.success }, style]}>
      <Icon icon={Check} size={14} color={c.canvas} strokeWidth={3} />
    </Animated.View>
  );
}

function CurrentDot() {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    if (!reduced) o.value = withRepeat(withTiming(0.35, { duration: 900, easing: ease.slow }), -1, true);
  }, [o, reduced]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <View style={[styles.dot, { borderWidth: 2, borderColor: c.warning, backgroundColor: 'transparent' }]}>
      <Animated.View style={[styles.inner, { backgroundColor: c.warning }, style]} />
    </View>
  );
}

/** Sent → teacher approved → recorded; the next step pulses while the backend works. */
export function LeaveTimeline({ leave }: { leave: LeaveRequest }) {
  const { c } = useTheme();
  const doneAt = new Map(leave.history.map((h) => [h.status, h.at]));
  const current = LEAVE_STEPS.find((s) => !doneAt.has(s));
  const seen = useRef(leave.history.length);

  useEffect(() => {
    if (leave.history.length > seen.current) haptic.light();
    seen.current = leave.history.length;
  }, [leave.history.length]);

  return (
    <View accessibilityRole="list">
      {LEAVE_STEPS.map((step, i) => {
        const at = doneAt.get(step);
        const isCurrent = step === current && leave.status !== 'rejected';
        const last = i === LEAVE_STEPS.length - 1;
        return (
          <View key={step} style={styles.row} accessible accessibilityLabel={`${LEAVE_STEP_LABEL[step as StepKey]} ${at ? 'เสร็จแล้ว' : isCurrent ? 'กำลังดำเนินการ' : 'รอ'}`}>
            <View style={styles.railCol}>
              {at ? <DoneDot key={at} /> : isCurrent ? <CurrentDot /> : <View style={[styles.dot, { borderWidth: 2, borderColor: c.hairline }]} />}
              {!last ? <View style={[styles.rail, { backgroundColor: at && doneAt.has(LEAVE_STEPS[i + 1]) ? c.success : c.hairline }]} /> : null}
            </View>
            <View style={styles.text}>
              <Text variant="body" tone={at || isCurrent ? 'primary' : 'secondary'}>
                {LEAVE_STEP_LABEL[step as StepKey]}
              </Text>
              <Text variant="caption" tone="secondary">
                {at ? `${timeHM(new Date(at))} · ${thaiDate(new Date(at), 'short')}` : isCurrent ? 'กำลังดำเนินการ…' : 'รอขั้นตอนก่อนหน้า'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  railCol: { alignItems: 'center', width: 24 },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 10, height: 10, borderRadius: 5 },
  rail: { width: 2, flex: 1, minHeight: 28, marginVertical: 4 },
  text: { flex: 1, paddingBottom: 20, gap: 2 },
});
