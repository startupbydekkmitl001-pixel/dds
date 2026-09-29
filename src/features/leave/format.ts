import { parseISODate, thaiDate } from '@/lib/format';

/** "29 ก.ย. 2569" or "29 ก.ย. – 1 ต.ค. 2569". */
export function leaveRange(start: string, end: string): string {
  if (start === end) return thaiDate(parseISODate(start), 'short');
  const a = parseISODate(start);
  const b = parseISODate(end);
  const left = thaiDate(a, 'short').split(' ');
  const sameYear = a.getFullYear() === b.getFullYear();
  return `${sameYear ? `${left[0]} ${left[1]}` : thaiDate(a, 'short')} – ${thaiDate(b, 'short')}`;
}
