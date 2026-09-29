import { HOLIDAYS, SEMESTERS, SEMESTER_ORDER } from '@/data/calendar';
import type { AttendanceDay, AttendanceStatus, Semester, SemesterId } from '@/data/types';
import { toISODate } from './clock';
import { parseISODate } from './format';

export const STATUS_ORDER: AttendanceStatus[] = ['present', 'late', 'noScan', 'sick', 'personal', 'absent'];

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'มา',
  late: 'สาย',
  noScan: 'ไม่ลงเวลา',
  sick: 'ลาป่วย',
  personal: 'ลากิจ',
  absent: 'ขาด',
};

export function countStatuses(days: AttendanceDay[]): Record<AttendanceStatus, number> {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<AttendanceStatus, number>;
  for (const d of days) counts[d.status] += 1;
  return counts;
}

/** Integer percent of recorded days attended (present or late). */
export function attendanceRate(c: Record<AttendanceStatus, number>): number {
  const total = STATUS_ORDER.reduce((sum, s) => sum + c[s], 0);
  return total === 0 ? 0 : Math.round(((c.present + c.late) / total) * 100);
}

/** Consecutive on-time days counted back from the latest record; leave days neither count nor break it. */
export function onTimeStreak(days: AttendanceDay[]): number {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));
  let streak = 0;
  for (const d of sorted) {
    if (d.status === 'present') streak += 1;
    else if (d.status === 'sick' || d.status === 'personal') continue;
    else break;
  }
  return streak;
}

export function isSchoolDay(date: string, holidays: string[] = HOLIDAYS): boolean {
  const dow = parseISODate(date).getDay();
  return dow !== 0 && dow !== 6 && !holidays.includes(date);
}

/** Monday-first weeks of `YYYY-MM-DD` strings, padded with nulls. */
export function monthGrid(year: number, month0: number): (string | null)[][] {
  const first = new Date(year, month0, 1);
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISODate(new Date(year, month0, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function semesterMonths(s: Semester): { year: number; month0: number }[] {
  const start = parseISODate(s.start);
  const end = parseISODate(s.end);
  const out: { year: number; month0: number }[] = [];
  let y = start.getFullYear();
  let m = start.getMonth();
  while (y < end.getFullYear() || (y === end.getFullYear() && m <= end.getMonth())) {
    out.push({ year: y, month0: m });
    m += 1;
    if (m === 12) {
      m = 0;
      y += 1;
    }
  }
  return out;
}

const WEEK_LABELS = ['จ', 'อ', 'พ', 'พฤ', 'ศ'];

export function weekStrip(
  days: AttendanceDay[],
  today: string,
): { date: string; label: string; status: AttendanceStatus | null }[] {
  const t = parseISODate(today);
  const offset = (t.getDay() + 6) % 7; // days since Monday
  const monday = new Date(t.getFullYear(), t.getMonth(), t.getDate() - offset);
  const byDate = new Map(days.map((d) => [d.date, d.status]));
  return WEEK_LABELS.map((label, i) => {
    const date = toISODate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
    return { date, label, status: byDate.get(date) ?? null };
  });
}

/** The running semester, or the most recent one before `today` (the first one if none has started). */
export function currentSemesterId(today: string): SemesterId {
  let current: SemesterId = SEMESTER_ORDER[0];
  for (const id of SEMESTER_ORDER) {
    if (SEMESTERS[id].start <= today) current = id;
  }
  return current;
}
