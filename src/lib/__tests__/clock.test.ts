import { now, setClock, toISODate } from '@/lib/clock';

afterEach(() => setClock(null));

test('setClock overrides now()', () => {
  setClock(() => new Date(2026, 8, 29, 7, 30));
  expect(now().getFullYear()).toBe(2026);
  expect(toISODate(now())).toBe('2026-09-29');
  setClock(null);
  expect(Math.abs(now().getTime() - Date.now())).toBeLessThan(1000);
});

test('toISODate pads month/day', () => {
  expect(toISODate(new Date(2027, 0, 5))).toBe('2027-01-05');
});
