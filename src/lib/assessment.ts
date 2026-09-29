import type { Assessment } from '@/data/types';

/** Per-dimension totals; unanswered questions score 0, max is the best option per question. */
export function scoreAssessment(
  a: Assessment,
  answers: Record<string, number>,
): Record<string, { score: number; max: number }> {
  const result: Record<string, { score: number; max: number }> = {};
  for (const q of a.questions) {
    const dim = (result[q.dimension] ??= { score: 0, max: 0 });
    dim.score += answers[q.id] ?? 0;
    dim.max += Math.max(...q.options.map((o) => o.value));
  }
  return result;
}
