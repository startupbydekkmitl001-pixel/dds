import { greetingFor } from '@/lib/greeting';

const at = (h: number, m = 0) => new Date(2026, 8, 29, h, m);

test('morning from 05:00 to 11:59', () => {
  expect(greetingFor(at(5))).toBe('สวัสดีตอนเช้า');
  expect(greetingFor(at(11, 59))).toBe('สวัสดีตอนเช้า');
});

test('afternoon from 12:00, evening from 17:00', () => {
  expect(greetingFor(at(12))).toBe('สวัสดีตอนบ่าย');
  expect(greetingFor(at(17))).toBe('สวัสดีตอนเย็น');
});

test('night falls back to plain greeting', () => {
  expect(greetingFor(at(21))).toBe('สวัสดี');
  expect(greetingFor(at(4, 59))).toBe('สวัสดี');
});
