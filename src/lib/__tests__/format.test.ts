import { toISODate } from '@/lib/clock';
import { formatBaht, parseISODate, relativeTime, thaiDate, thaiMonthLong, timeHM } from '@/lib/format';

describe('formatBaht', () => {
  test('whole baht with thousands separator', () => {
    expect(formatBaht(1245)).toBe('฿1,245');
    expect(formatBaht(0)).toBe('฿0');
  });
  test('fractional baht shows two decimals', () => {
    expect(formatBaht(1245.5)).toBe('฿1,245.50');
  });
  test('sign option and negative amounts use U+2212 minus', () => {
    expect(formatBaht(50, { sign: true })).toBe('+฿50');
    expect(formatBaht(-35, { sign: true })).toBe('−฿35');
    expect(formatBaht(-35)).toBe('−฿35');
  });
});

describe('Thai dates (Buddhist era)', () => {
  const d = new Date(2026, 8, 29, 7, 5);
  test('styles', () => {
    expect(thaiDate(d, 'short')).toBe('29 ก.ย. 2569');
    expect(thaiDate(d, 'long')).toBe('29 กันยายน 2569');
    expect(thaiDate(d, 'weekdayShort')).toBe('อ. 29 ก.ย. 2569');
    expect(thaiDate(d, 'numeric')).toBe('29/09/69');
  });
  test('timeHM pads', () => {
    expect(timeHM(d)).toBe('07:05');
  });
  test('parseISODate round-trips local dates', () => {
    expect(toISODate(parseISODate('2026-09-29'))).toBe('2026-09-29');
  });
  test('thaiMonthLong', () => {
    expect(thaiMonthLong(0)).toBe('มกราคม');
    expect(thaiMonthLong(10)).toBe('พฤศจิกายน');
  });
});

describe('relativeTime', () => {
  const n = new Date(2026, 8, 29, 12, 0);
  test('under a minute', () => {
    expect(relativeTime(new Date(n.getTime() - 30_000), n)).toBe('เมื่อสักครู่');
  });
  test('minutes and hours', () => {
    expect(relativeTime(new Date(n.getTime() - 5 * 60_000), n)).toBe('5 นาทีที่แล้ว');
    expect(relativeTime(new Date(n.getTime() - 2 * 3_600_000), n)).toBe('2 ชม. ที่แล้ว');
  });
  test('previous calendar day reads yesterday even when under 24h', () => {
    expect(relativeTime(new Date(2026, 8, 28, 23, 0), n)).toBe('เมื่อวาน');
  });
  test('older falls back to short date', () => {
    expect(relativeTime(new Date(2026, 8, 20, 9, 0), n)).toBe('20 ก.ย. 2569');
  });
});
