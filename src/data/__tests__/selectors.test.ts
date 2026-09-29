import { buildSeed, DEFAULT_SETTINGS } from '@/data/seed';
import {
  groupByDay,
  semesterDays,
  semesterStarted,
  spendByDay,
  spentToday,
  todayInfo,
  unreadCount,
} from '@/data/selectors';
import type { LeaveRequest } from '@/data/types';

const N = new Date(2026, 8, 29, 9, 0);
const s = buildSeed(N);
const demo = DEFAULT_SETTINGS.demo;

const leaveFixture: LeaveRequest = {
  id: 'lv_1',
  clientId: 'c',
  type: 'sick',
  start: '2026-09-29',
  end: '2026-09-29',
  reason: 'ไข้หวัดใหญ่',
  photoUri: null,
  status: 'approved',
  history: [],
  createdAt: '2026-09-28T08:00:00.000Z',
  nextAt: null,
};

describe('todayInfo', () => {
  test('follows the demo arrival setting on a school day', () => {
    expect(todayInfo(s, demo, N)).toEqual({ kind: 'arrived', checkIn: '07:32', onTime: true });
    expect(todayInfo(s, { ...demo, arrival: 'notYet' }, N)).toEqual({ kind: 'notYet', gateClose: '08:00' });
    expect(todayInfo(s, { ...demo, arrival: 'onLeave' }, N)).toEqual({ kind: 'onLeave', leaveType: 'sick' });
  });

  test('no school on weekends, holidays and between semesters', () => {
    expect(todayInfo(s, demo, new Date(2026, 8, 26, 9))).toEqual({ kind: 'noSchool' });
    expect(todayInfo(s, demo, new Date(2026, 6, 28, 9))).toEqual({ kind: 'noSchool' });
    expect(todayInfo(s, demo, new Date(2026, 9, 20, 9))).toEqual({ kind: 'noSchool' });
  });

  test('an approved leave covering today wins over the demo setting', () => {
    const withLeave = { ...s, leaves: [{ ...leaveFixture, type: 'personal' as const }] };
    expect(todayInfo(withLeave, demo, N)).toEqual({ kind: 'onLeave', leaveType: 'personal' });
    const pending = { ...s, leaves: [{ ...leaveFixture, status: 'submitted' as const }] };
    expect(todayInfo(pending, demo, N).kind).toBe('arrived');
  });
});

describe('semesterDays', () => {
  test('appends today only when arrived', () => {
    expect(semesterDays(s, '2569-1', demo, N).at(-1)).toMatchObject({ date: '2026-09-29', status: 'present', checkIn: '07:32' });
    expect(semesterDays(s, '2569-1', { ...demo, arrival: 'notYet' }, N).at(-1)!.date).toBe('2026-09-28');
  });
  test('semester 2 is empty and not started', () => {
    expect(semesterDays(s, '2569-2', demo, N)).toEqual([]);
    expect(semesterStarted('2569-2', N)).toBe(false);
    expect(semesterStarted('2569-1', N)).toBe(true);
  });
});

test('spendByDay covers the last 7 days oldest first', () => {
  const d = spendByDay(s.wallet.transactions, N);
  expect(d).toHaveLength(7);
  expect(d[6].date).toBe('2026-09-29');
  expect(d[0].date).toBe('2026-09-23');
});

test('spentToday sums only today’s purchases', () => {
  const tx = [
    { id: 'a', kind: 'purchase' as const, amount: 35, at: new Date(2026, 8, 29, 12).toISOString(), title: 'x' },
    { id: 'b', kind: 'topup' as const, amount: 50, at: new Date(2026, 8, 29, 11).toISOString(), title: 'y' },
    { id: 'c', kind: 'purchase' as const, amount: 10, at: new Date(2026, 8, 28, 12).toISOString(), title: 'z' },
  ];
  expect(spentToday(tx, N)).toBe(35);
});

test('groupByDay is newest first', () => {
  const g = groupByDay(s.wallet.transactions);
  expect(g[0].date > g[1].date).toBe(true);
});

test('unreadCount', () => {
  expect(unreadCount(s.alerts)).toBe(2);
});
