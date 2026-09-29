import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { IconButton, Text } from '@/components/ui';
import { monthGrid } from '@/lib/attendance';
import { beYear, parseISODate, thaiMonthLong } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { dur, ease } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';

export interface DayLook {
  dot?: string;
  muted?: boolean;
  today?: boolean;
  disabled?: boolean;
  selected?: boolean;
  inRange?: boolean;
  label?: string;
}

const WEEK_HEAD = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
const CELL = 42;

/** Month grid with swipe/arrow paging, limited to the given months. Reused by the leave date picker. */
export function MonthCalendar({
  months,
  initialIndex,
  renderDay,
  onDayPress,
}: {
  months: { year: number; month0: number }[];
  initialIndex: number;
  renderDay: (date: string) => DayLook;
  onDayPress: (date: string) => void;
}) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(Math.min(Math.max(0, initialIndex), months.length - 1));
  const [dir, setDir] = useState(1);
  const m = months[index];
  const grid = useMemo(() => monthGrid(m.year, m.month0), [m.year, m.month0]);

  const enter = useSharedValue(1);
  useEffect(() => {
    enter.value = 0;
    enter.value = withTiming(1, { duration: reduced ? dur.fast : dur.base, easing: ease.base });
  }, [index, enter, reduced]);
  const gridStyle = useAnimatedStyle(() => ({ opacity: enter.value, transform: [{ translateX: reduced ? 0 : (1 - enter.value) * 24 * dir }] }));

  const go = (delta: number) => {
    const next = index + delta;
    if (next < 0 || next >= months.length) return;
    haptic.selection();
    setDir(delta);
    setIndex(next);
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-24, 24])
    .failOffsetY([-16, 16])
    .onEnd((e) => {
      if (e.translationX < -48) go(1);
      else if (e.translationX > 48) go(-1);
    });

  return (
    <View>
      <View style={styles.head}>
        <IconButton icon={ChevronLeft} label="เดือนก่อนหน้า" tone="plain" onPress={() => go(-1)} />
        <Text variant="heading" accessibilityLiveRegion="polite">
          {`${thaiMonthLong(m.month0)} ${beYear(new Date(m.year, m.month0, 1))}`}
        </Text>
        <IconButton icon={ChevronRight} label="เดือนถัดไป" tone="plain" onPress={() => go(1)} />
      </View>
      <View style={styles.week}>
        {WEEK_HEAD.map((d) => (
          <Text key={d} variant="caption" tone="secondary" style={styles.weekCell}>
            {d}
          </Text>
        ))}
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={gridStyle}>
          {grid.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((date, ci) => {
                if (!date) return <View key={ci} style={styles.cell} />;
                const look = renderDay(date);
                const dayNum = parseISODate(date).getDate();
                const bg = look.selected ? c.primary : look.inRange ? c.secondary : 'transparent';
                const fg = look.selected ? c.onPrimary : look.muted || look.disabled ? c.textSecondary : c.text;
                return (
                  <Pressable
                    key={date}
                    disabled={look.disabled}
                    onPress={() => onDayPress(date)}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !!look.disabled, selected: !!look.selected }}
                    accessibilityLabel={`${dayNum} ${thaiMonthLong(m.month0)}${look.label ? ` ${look.label}` : ''}`}
                    style={styles.cell}
                  >
                    <View
                      style={[
                        styles.day,
                        { backgroundColor: bg, borderColor: look.today ? c.text : 'transparent', opacity: look.disabled ? 0.4 : 1 },
                      ]}
                    >
                      <Text variant="data" size={14} color={fg}>
                        {String(dayNum)}
                      </Text>
                    </View>
                    <View style={[styles.dot, { backgroundColor: look.dot ?? 'transparent' }]} />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  week: { flexDirection: 'row', marginBottom: 4 },
  weekCell: { flex: 1, textAlign: 'center' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3, minHeight: CELL + 8 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
});
