import type { Semester, SemesterId } from './types';

/** Academic year 2569 (spec §2). */
export const SEMESTERS: Record<SemesterId, Semester> = {
  '2569-1': { id: '2569-1', label: 'ภาคเรียนที่ 1', start: '2026-05-16', end: '2026-10-10' },
  '2569-2': { id: '2569-2', label: 'ภาคเรียนที่ 2', start: '2026-11-01', end: '2027-03-31' },
};

export const SEMESTER_ORDER: SemesterId[] = ['2569-1', '2569-2'];

/** Fixed-date school holidays inside the academic year. */
export const HOLIDAYS: string[] = [
  '2026-06-03',
  '2026-07-28',
  '2026-08-12',
  '2026-12-07',
  '2026-12-10',
  '2026-12-31',
  '2027-01-01',
];
