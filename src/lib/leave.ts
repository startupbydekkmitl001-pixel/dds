import { HOLIDAYS } from '@/data/calendar';
import type { LeaveStatus, LeaveType } from '@/data/types';
import { isSchoolDay } from './attendance';
import { toISODate } from './clock';
import { parseISODate } from './format';

/** Every `YYYY-MM-DD` from start to end inclusive (empty when end < start). */
export function datesBetween(start: string, end: string): string[] {
  if (end < start) return [];
  const out: string[] = [];
  const d = parseISODate(start);
  for (let cur = toISODate(d); cur <= end; ) {
    out.push(cur);
    d.setDate(d.getDate() + 1);
    cur = toISODate(d);
  }
  return out;
}

export function schoolDaysBetween(start: string, end: string, holidays: string[] = HOLIDAYS): number {
  return datesBetween(start, end).filter((d) => isSchoolDay(d, holidays)).length;
}

export function validateLeave(i: {
  type: LeaveType | null;
  start: string | null;
  end: string | null;
  reason: string;
}): { type?: string; dates?: string; reason?: string } {
  const errors: { type?: string; dates?: string; reason?: string } = {};
  if (!i.type) errors.type = 'เลือกประเภทการลา';
  if (!i.start || !i.end) errors.dates = 'เลือกวันที่ลา';
  else if (schoolDaysBetween(i.start, i.end) === 0) errors.dates = 'ช่วงวันที่นี้ไม่มีวันเรียน';
  const length = [...i.reason.trim()].length;
  if (length < 5) errors.reason = 'ระบุเหตุผลอย่างน้อย 5 ตัวอักษร';
  else if (length > 300) errors.reason = 'ไม่เกิน 300 ตัวอักษร';
  return errors;
}

export const LEAVE_STEPS: LeaveStatus[] = ['submitted', 'approved', 'recorded'];

export const LEAVE_STEP_LABEL: Record<'submitted' | 'approved' | 'recorded', string> = {
  submitted: 'ส่งใบลาแล้ว',
  approved: 'ครูที่ปรึกษาอนุมัติ',
  recorded: 'บันทึกในระบบแล้ว',
};

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = { sick: 'ลาป่วย', personal: 'ลากิจ' };

export function nextLeaveStatus(s: LeaveStatus): LeaveStatus | null {
  if (s === 'submitted') return 'approved';
  if (s === 'approved') return 'recorded';
  return null;
}

/** How long the simulated backend waits before advancing a request out of `from`. */
export function leaveDelayMs(from: LeaveStatus, fast: boolean): number {
  if (from === 'submitted') return fast ? 5_000 : 30_000;
  if (from === 'approved') return fast ? 3_000 : 10_000;
  return 0;
}
