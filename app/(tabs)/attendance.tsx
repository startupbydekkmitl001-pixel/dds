import { router } from 'expo-router';
import { CalendarClock } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StaggerIn } from '@/components/motion';
import { Card, EmptyState, LoadGate, Screen, ScreenHeader, Segmented, Skeleton, Text } from '@/components/ui';
import { HOLIDAYS, SEMESTERS } from '@/data/calendar';
import { semesterDays, semesterStarted } from '@/data/selectors';
import { useApp } from '@/data/store';
import type { SemesterId } from '@/data/types';
import { useResource } from '@/data/useResource';
import { AttendanceRing } from '@/features/attendance/AttendanceRing';
import { MonthCalendar } from '@/features/attendance/MonthCalendar';
import { StatusRows } from '@/features/attendance/StatusRows';
import { StreakChip } from '@/features/attendance/StreakChip';
import { LeaveSection } from '@/features/leave/LeaveSection';
import { attendanceRate, countStatuses, currentSemesterId, isSchoolDay, onTimeStreak, semesterMonths, STATUS_LABEL } from '@/lib/attendance';
import { toISODate } from '@/lib/clock';
import { parseISODate, thaiDate } from '@/lib/format';
import { useNow } from '@/lib/useNow';
import { useTheme } from '@/theme/ThemeProvider';

function AttendanceSkeleton() {
  return (
    <View style={styles.stack}>
      <Skeleton height={260} />
      <Skeleton height={200} />
      <Skeleton height={320} />
    </View>
  );
}

/** Spec §5.5 — attendance with real numbers, calendar, and leave requests. */
export default function AttendanceScreen() {
  const { statusColor } = useTheme();
  const res = useResource('attendance');
  const t = useNow();
  const today = toISODate(t);
  const [semId, setSemId] = useState<SemesterId>(() => currentSemesterId(today));
  const attendance = useApp((s) => s.attendance);
  const leaves = useApp((s) => s.leaves);
  const demo = useApp((s) => s.settings.demo);

  const sem = SEMESTERS[semId];
  const started = semesterStarted(semId, t);
  const days = useMemo(() => semesterDays({ leaves, attendance }, semId, demo, t), [leaves, attendance, semId, demo, t]);
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const counts = useMemo(() => countStatuses(days.filter((d) => d.date <= today)), [days, today]);
  const months = useMemo(() => semesterMonths(sem), [sem]);
  const initialMonth = useMemo(() => {
    const i = months.findIndex((m) => m.year === t.getFullYear() && m.month0 === t.getMonth());
    return i >= 0 ? i : today > sem.end ? months.length - 1 : 0;
  }, [months, t, today, sem.end]);

  return (
    <Screen
      title="เวลาเรียน"
      header={<ScreenHeader eyebrow={sem.label} title="เวลาเรียน" />}
      onRefresh={res.refresh}
      refreshing={res.refreshing}
    >
      <Segmented
        options={[
          { value: '2569-1', label: 'ภาคเรียน 1' },
          { value: '2569-2', label: 'ภาคเรียน 2' },
        ]}
        value={semId}
        onChange={setSemId}
        style={styles.segment}
      />
      <LoadGate status={res.status} retry={res.retry} skeleton={<AttendanceSkeleton />}>
        {!started ? (
          <EmptyState
            feature="attendance"
            icon={CalendarClock}
            title={`${sem.label}ยังไม่เริ่ม`}
            body={`เริ่ม ${thaiDate(parseISODate(sem.start), 'short')}`}
          />
        ) : (
          <View style={styles.stack} key={semId}>
            <StaggerIn index={0}>
              <Card style={styles.ringCard}>
                <AttendanceRing counts={counts} rate={attendanceRate(counts)} />
                <StreakChip days={onTimeStreak(days.filter((d) => d.date <= today))} />
              </Card>
            </StaggerIn>
            <StaggerIn index={1}>
              <Card>
                <Text variant="label" tone="secondary" style={styles.cardTitle}>
                  สรุปการมาเรียน
                </Text>
                <StatusRows counts={counts} />
              </Card>
            </StaggerIn>
            <StaggerIn index={2}>
              <Card>
                <MonthCalendar
                  key={semId}
                  months={months}
                  initialIndex={initialMonth}
                  renderDay={(date) => {
                    const rec = byDate.get(date);
                    const school = isSchoolDay(date, HOLIDAYS);
                    return {
                      dot: rec ? statusColor[rec.status] : undefined,
                      muted: !school,
                      today: date === today,
                      label: rec ? STATUS_LABEL[rec.status] : school ? undefined : 'วันหยุด',
                    };
                  }}
                  onDayPress={(date) => {
                    if (byDate.has(date)) router.push(`/day/${date}`);
                  }}
                />
              </Card>
            </StaggerIn>
          </View>
        )}
        <LeaveSection semesterId={semId} />
      </LoadGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { marginBottom: 16 },
  stack: { gap: 12 },
  ringCard: { gap: 16, paddingVertical: 24 },
  cardTitle: { marginBottom: 14 },
});
