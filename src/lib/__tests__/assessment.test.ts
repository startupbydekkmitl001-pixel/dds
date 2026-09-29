import type { Assessment } from '@/data/types';
import { scoreAssessment } from '@/lib/assessment';

const zeroToTwo = [0, 1, 2].map((v) => ({ label: String(v), value: v }));
const oneToFour = [1, 2, 3, 4].map((v) => ({ label: String(v), value: v }));

const fixture: Assessment = {
  id: 'eq',
  title: 't',
  description: 'd',
  completedAt: null,
  result: null,
  questions: [
    { id: 'q1', text: 'a', dimension: 'A', options: zeroToTwo },
    { id: 'q2', text: 'b', dimension: 'A', options: zeroToTwo },
    { id: 'q3', text: 'c', dimension: 'B', options: oneToFour },
  ],
};

test('sums answers per dimension against the max option values', () => {
  expect(scoreAssessment(fixture, { q1: 2, q2: 1, q3: 4 })).toEqual({ A: { score: 3, max: 4 }, B: { score: 4, max: 4 } });
});

test('unanswered questions score zero', () => {
  expect(scoreAssessment(fixture, { q1: 2 })).toEqual({ A: { score: 2, max: 4 }, B: { score: 0, max: 4 } });
});
