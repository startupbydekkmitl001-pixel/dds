import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import type { Semester } from '@/data/types';
import { isSchoolDay, semesterMonths } from '@/lib/attendance';
import { now, toISODate } from '@/lib/clock';
import { schoolDaysBetween } from '@/lib/leave';
import { MonthCalendar } from '../attendance/MonthCalendar';

/** Tap a start day, then an end day; non-school days can't be chosen. */
export function DateRangePicker({
  semester,
  start,
  end,
  onChange,
}: {
  semester: Semester;
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
}) {
  const today = toISODate(now());
  const months = useMemo(() => semesterMonths(semester), [semester]);
  const initial = Math.max(
    0,
    months.findIndex((m) => `${m.year}-${String(m.month0 + 1).padStart(2, '0')}` === today.slice(0, 7)),
  );
  const last = end ?? start;
  const count = start && last ? schoolDaysBetween(start, last) : 0;

  return (
    <View>
      <MonthCalendar
        months={months}
        initialIndex={initial}
        renderDay={(date) => {
          const school = isSchoolDay(date) && date >= semester.start && date <= semester.end;
          return {
            disabled: !school,
            muted: !school,
            today: date === today,
            selected: date === start || date === end,
            inRange: !!(start && end && date > start && date < end && school),
          };
        }}
        onDayPress={(date) => {
          if (!start || end || date < start) onChange(date, null);
          else if (date === start) onChange(null, null);
          else onChange(start, date);
        }}
      />
      <Text variant="label" tone={count ? 'primary' : 'secondary'} center accessibilityLiveRegion="polite">
        {start ? `รวม ${count} วันเรียน` : 'แตะวันที่เริ่มลา แล้วแตะวันสุดท้าย'}
      </Text>
    </View>
  );
}
