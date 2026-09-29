import { SEMESTERS } from '@/data/calendar';
import type { AttendanceDay, AttendanceStatus } from '@/data/types';
import {
  attendanceRate,
  countStatuses,
  currentSemesterId,
  isSchoolDay,
  monthGrid,
  onTimeStreak,
  semesterMonths,
  weekStrip,
} from '@/lib/attendance';

const day = (date: string, status: AttendanceStatus): AttendanceDay => ({ date, status, checkIn: null, gate: null });

test('countStatuses fills every status key', () => {
  expect(countStatuses([day('2026-09-21', 'present'), day('2026-09-22', 'late')])).toEqual({
    present: 1, late: 1, noScan: 0, sick: 0, personal: 0, absent: 0,
  });
});

test('attendanceRate counts present + late as attended', () => {
  expect(attendanceRate({ present: 40, late: 2, noScan: 1, sick: 2, personal: 1, absent: 0 })).toBe(91);
  expect(attendanceRate({ present: 0, late: 0, noScan: 0, sick: 0, personal: 0, absent: 0 })).toBe(0);
});

test('onTimeStreak skips leave days, breaks on late, ignores input order', () => {
  const seq = ['present', 'present', 'late', 'present', 'sick', 'present', 'present'] as const;
  const days = seq.map((s, i) => day(`2026-09-${String(21 + i).padStart(2, '0')}`, s)).reverse();
  expect(onTimeStreak(days)).toBe(3);
  expect(onTimeStreak([])).toBe(0);
});

test('isSchoolDay excludes weekends and holidays', () => {
  expect(isSchoolDay('2026-09-26')).toBe(false);
  expect(isSchoolDay('2026-09-28')).toBe(true);
  expect(isSchoolDay('2026-07-28')).toBe(false);
});

test('monthGrid is Monday-first and padded with nulls', () => {
  const g = monthGrid(2026, 8);
  expect(g[0]).toEqual([null, '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06']);
  expect(g.length).toBe(5);
  expect(g.every((r) => r.length === 7)).toBe(true);
  expect(g[4].slice(0, 3)).toEqual(['2026-09-28', '2026-09-29', '2026-09-30']);
  expect(g[4].slice(3)).toEqual([null, null, null, null]);
});

test('semesterMonths lists each month the semester touches', () => {
  expect(semesterMonths(SEMESTERS['2569-1']).map((m) => m.month0)).toEqual([4, 5, 6, 7, 8, 9]);
  expect(semesterMonths(SEMESTERS['2569-2']).map((m) => `${m.year}-${m.month0}`)).toEqual([
    '2026-10', '2026-11', '2027-0', '2027-1', '2027-2',
  ]);
});

test('weekStrip returns Mon–Fri of the current week', () => {
  const w = weekStrip([day('2026-09-28', 'present')], '2026-09-29');
  expect(w.map((x) => x.label)).toEqual(['จ', 'อ', 'พ', 'พฤ', 'ศ']);
  expect(w[0]).toEqual({ date: '2026-09-28', label: 'จ', status: 'present' });
  expect(w[1].status).toBeNull();
  expect(w[4].date).toBe('2026-10-02');
});

test('weekStrip on a Sunday shows the week that is ending', () => {
  expect(weekStrip([], '2026-10-04')[0].date).toBe('2026-09-28');
});

test('currentSemesterId picks the running or most recent semester', () => {
  expect(currentSemesterId('2026-09-29')).toBe('2569-1');
  expect(currentSemesterId('2026-10-20')).toBe('2569-1');
  expect(currentSemesterId('2026-11-02')).toBe('2569-2');
  expect(currentSemesterId('2027-04-10')).toBe('2569-2');
  expect(currentSemesterId('2026-03-01')).toBe('2569-1');
});
