import { buildSeed, DEMO_PIN, SCHOOL_ACCOUNT } from '@/data/seed';
import { behaviorScore } from '@/data/selectors';
import { isSchoolDay, onTimeStreak } from '@/lib/attendance';

const N = new Date(2026, 8, 29, 9, 0); // Tuesday

test('seed is deterministic for the same "now"', () => {
  expect(buildSeed(N)).toEqual(buildSeed(N));
});

test('wallet balance equals the signed sum of transactions', () => {
  const s = buildSeed(N);
  const signed = s.wallet.transactions.reduce((a, t) => a + (t.kind === 'topup' ? t.amount : -t.amount), 0);
  expect(s.wallet.balance).toBe(signed);
  expect(s.wallet.balance).toBeGreaterThan(0);
  expect(s.wallet.frozen).toBe(false);
  expect(s.wallet.pending).toEqual([]);
});

test('semester 1 attendance covers school days up to yesterday', () => {
  const d1 = buildSeed(N).attendance['2569-1'];
  expect(d1[0].date).toBe('2026-05-18');
  expect(d1.at(-1)!.date).toBe('2026-09-28');
  expect(d1.every((d) => isSchoolDay(d.date))).toBe(true);
  expect(d1.filter((d) => d.status === 'present').length / d1.length).toBeGreaterThan(0.8);
  expect(onTimeStreak(d1)).toBeGreaterThanOrEqual(12);
});

test('semester 2 has no attendance before it starts', () => {
  expect(buildSeed(N).attendance['2569-2']).toEqual([]);
});

test('placeholder identity and account', () => {
  const s = buildSeed(N);
  expect(s.student).toMatchObject({ firstName: 'ภูมิภัทร', classroom: 'ม.5/3', id: '24815' });
  expect(DEMO_PIN).toBe('123456');
  expect(SCHOOL_ACCOUNT.number).toBe('123-4-56789-0');
});

test('five unclaimed bank transfers, newest first', () => {
  const t = buildSeed(N).wallet.transfers;
  expect(t).toHaveLength(5);
  expect(t.every((x) => !x.claimed)).toBe(true);
  expect(t[0].at >= t[1].at).toBe(true);
});

test('behavior nets to a full score', () => {
  expect(behaviorScore(buildSeed(N).behavior)).toBe(100);
});

test('alerts link to real routes and two are unread', () => {
  const a = buildSeed(N).alerts;
  expect(a).toHaveLength(4);
  expect(a.filter((x) => !x.read)).toHaveLength(2);
  expect(a.every((x) => /^\/(wallet|attendance|announcement\/.+)$/.test(x.link))).toBe(true);
});

test('assessments have ten original questions each', () => {
  const a = buildSeed(N).assessments;
  expect(a.map((x) => x.id)).toEqual(['eq', 'sdq']);
  expect(a.every((x) => x.questions.length === 10 && x.completedAt === null)).toBe(true);
});
