import { leaveDelayMs, nextLeaveStatus, schoolDaysBetween, validateLeave } from '@/lib/leave';

test('schoolDaysBetween counts inclusive school days only', () => {
  expect(schoolDaysBetween('2026-09-28', '2026-10-02')).toBe(5);
  expect(schoolDaysBetween('2026-09-25', '2026-09-28')).toBe(2);
  expect(schoolDaysBetween('2026-07-27', '2026-07-29')).toBe(2);
  expect(schoolDaysBetween('2026-09-29', '2026-09-28')).toBe(0);
  expect(schoolDaysBetween('2026-09-26', '2026-09-27')).toBe(0);
});

describe('validateLeave', () => {
  const ok = { type: 'sick' as const, start: '2026-09-28', end: '2026-09-29', reason: 'ไข้หวัดใหญ่' };
  test('valid input has no errors', () => {
    expect(validateLeave(ok)).toEqual({});
  });
  test('type and dates are required', () => {
    expect(validateLeave({ ...ok, type: null }).type).toBe('เลือกประเภทการลา');
    expect(validateLeave({ ...ok, start: null }).dates).toBe('เลือกวันที่ลา');
    expect(validateLeave({ ...ok, end: null }).dates).toBe('เลือกวันที่ลา');
  });
  test('a range with no school days is rejected', () => {
    expect(validateLeave({ ...ok, start: '2026-09-26', end: '2026-09-27' }).dates).toBe('ช่วงวันที่นี้ไม่มีวันเรียน');
  });
  test('reason length is 5–300 characters after trimming', () => {
    expect(validateLeave({ ...ok, reason: '  ปวด ' }).reason).toBe('ระบุเหตุผลอย่างน้อย 5 ตัวอักษร');
    expect(validateLeave({ ...ok, reason: 'ก'.repeat(301) }).reason).toBe('ไม่เกิน 300 ตัวอักษร');
    expect(validateLeave({ ...ok, reason: 'ก'.repeat(300) }).reason).toBeUndefined();
  });
});

test('status progression', () => {
  expect([nextLeaveStatus('submitted'), nextLeaveStatus('approved'), nextLeaveStatus('recorded'), nextLeaveStatus('rejected')])
    .toEqual(['approved', 'recorded', null, null]);
});

test('simulated backend delays', () => {
  expect([leaveDelayMs('submitted', false), leaveDelayMs('submitted', true), leaveDelayMs('approved', false), leaveDelayMs('approved', true)])
    .toEqual([30_000, 5_000, 10_000, 3_000]);
  expect(leaveDelayMs('recorded', false)).toBe(0);
});
