import { isSchoolDay } from '@/lib/attendance';
import { toISODate } from '@/lib/clock';
import { SEMESTERS } from './calendar';
import type { AppData } from './seed';
import type {
  AppAlert,
  Assessment,
  AttendanceDay,
  BehaviorEvent,
  DemoSettings,
  LeaveRequest,
  LeaveType,
  SemesterId,
  Transaction,
} from './types';

export type TodayInfo =
  | { kind: 'arrived'; checkIn: string; onTime: boolean }
  | { kind: 'notYet'; gateClose: string }
  | { kind: 'onLeave'; leaveType: LeaveType }
  | { kind: 'noSchool' };

const DEMO_CHECK_IN = '07:32';
const GATE_CLOSE = '08:00';

function inAnySemester(date: string): boolean {
  return Object.values(SEMESTERS).some((s) => s.start <= date && date <= s.end);
}

export function todayInfo(d: AppData, demo: DemoSettings, now: Date): TodayInfo {
  const today = toISODate(now);
  if (!isSchoolDay(today) || !inAnySemester(today)) return { kind: 'noSchool' };
  const leave = d.leaves.find(
    (l) => (l.status === 'approved' || l.status === 'recorded') && l.start <= today && today <= l.end,
  );
  if (leave) return { kind: 'onLeave', leaveType: leave.type };
  if (demo.arrival === 'notYet') return { kind: 'notYet', gateClose: GATE_CLOSE };
  if (demo.arrival === 'onLeave') return { kind: 'onLeave', leaveType: 'sick' };
  return { kind: 'arrived', checkIn: DEMO_CHECK_IN, onTime: DEMO_CHECK_IN <= GATE_CLOSE };
}

export function semesterDays(d: AppData, id: SemesterId, demo: DemoSettings, now: Date): AttendanceDay[] {
  const sem = SEMESTERS[id];
  const today = toISODate(now);
  const days = [...d.attendance[id]];
  const inSemester = sem.start <= today && today <= sem.end;
  if (inSemester && todayInfo(d, demo, now).kind === 'arrived' && !days.some((x) => x.date === today)) {
    days.push({ date: today, status: 'present', checkIn: DEMO_CHECK_IN, gate: 'ประตู 1' });
  }
  return days.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function semesterStarted(id: SemesterId, now: Date): boolean {
  return SEMESTERS[id].start <= toISODate(now);
}

export function unreadCount(alerts: AppAlert[]): number {
  return alerts.filter((a) => !a.read).length;
}

const txDate = (t: Transaction) => toISODate(new Date(t.at));

export function spendByDay(tx: Transaction[], now: Date, days = 7): { date: string; total: number }[] {
  const out: { date: string; total: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
    const total = tx.filter((t) => t.kind === 'purchase' && txDate(t) === date).reduce((s, t) => s + t.amount, 0);
    out.push({ date, total });
  }
  return out;
}

export function spentToday(tx: Transaction[], now: Date): number {
  const today = toISODate(now);
  return tx.filter((t) => t.kind === 'purchase' && txDate(t) === today).reduce((s, t) => s + t.amount, 0);
}

export function groupByDay(tx: Transaction[]): { date: string; items: Transaction[] }[] {
  const groups = new Map<string, Transaction[]>();
  for (const t of [...tx].sort((a, b) => (a.at < b.at ? 1 : -1))) {
    const key = txDate(t);
    const list = groups.get(key);
    if (list) list.push(t);
    else groups.set(key, [t]);
  }
  return [...groups.entries()].sort(([a], [b]) => (a < b ? 1 : -1)).map(([date, items]) => ({ date, items }));
}

export function behaviorScore(events: BehaviorEvent[]): number {
  return Math.min(100, 100 + events.reduce((s, e) => s + e.delta, 0));
}

export function pendingLeaves(l: LeaveRequest[]): number {
  return l.filter((x) => x.status === 'submitted').length;
}

export function dueAssessments(a: Assessment[]): number {
  return a.filter((x) => x.completedAt === null).length;
}
