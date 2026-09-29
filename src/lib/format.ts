/**
 * Thai display formatting. Hand-rolled (no Intl calendars) so output is
 * identical on Hermes, JSC and web, and always in the Buddhist era.
 */
import { toISODate } from './clock';

const MONTH_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const MONTH_LONG = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
/** Sunday-first, matching Date#getDay(). */
export const THAI_WEEKDAY_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'] as const;

const MINUS = '−';
const pad2 = (n: number) => String(n).padStart(2, '0');

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatBaht(n: number, opts?: { sign?: boolean }): string {
  const abs = Math.abs(n);
  const isWhole = Number.isInteger(abs);
  const [int, frac] = (isWhole ? String(abs) : abs.toFixed(2)).split('.');
  const body = `฿${groupThousands(int)}${frac ? `.${frac}` : ''}`;
  if (n < 0) return `${MINUS}${body}`;
  if (opts?.sign && n > 0) return `+${body}`;
  return body;
}

export const beYear = (d: Date) => d.getFullYear() + 543;

export function thaiMonthLong(month0: number): string {
  return MONTH_LONG[month0];
}

export function thaiMonthShort(month0: number): string {
  return MONTH_SHORT[month0];
}

export function thaiDate(d: Date, style: 'short' | 'long' | 'weekdayShort' | 'numeric'): string {
  const day = d.getDate();
  switch (style) {
    case 'short':
      return `${day} ${MONTH_SHORT[d.getMonth()]} ${beYear(d)}`;
    case 'long':
      return `${day} ${MONTH_LONG[d.getMonth()]} ${beYear(d)}`;
    case 'weekdayShort':
      return `${THAI_WEEKDAY_SHORT[d.getDay()]} ${day} ${MONTH_SHORT[d.getMonth()]} ${beYear(d)}`;
    case 'numeric':
      return `${pad2(day)}/${pad2(d.getMonth() + 1)}/${String(beYear(d)).slice(-2)}`;
  }
}

export function timeHM(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** `YYYY-MM-DD` → local midnight. */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

export function relativeTime(at: Date, now: Date): string {
  const diffMs = now.getTime() - at.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const yesterday = toISODate(addDays(now, -1));
  if (toISODate(at) === yesterday && minutes > 60) return 'เมื่อวาน';
  if (diffMs < 60_000) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24 && toISODate(at) === toISODate(now)) return `${hours} ชม. ที่แล้ว`;
  if (toISODate(at) === yesterday) return 'เมื่อวาน';
  return thaiDate(at, 'short');
}
