import { PASS_PERCENT } from './config';
import type { Attempt, AttemptResult, Domain, DomainResult, Question, SubmitReason } from './types';

export function isExactMatch(question: Question, selected: readonly string[] | undefined): boolean {
  if (!selected || selected.length !== question.correctOptionIds.length) return false;
  const set = new Set(selected);
  return set.size === selected.length && question.correctOptionIds.every((id) => set.has(id));
}

export function isPassing(correct: number, total: number): boolean {
  // Integer comparison avoids floating-point drift at the 48/60 boundary.
  return total > 0 && correct * 100 >= total * PASS_PERCENT;
}

export function scoreAttempt(
  attempt: Pick<Attempt, 'questions' | 'answers'>,
  domains: readonly Domain[],
  reason: SubmitReason,
  elapsedMs: number,
): AttemptResult {
  const perQuestion: AttemptResult['perQuestion'] = {};
  const byDomain = new Map<string, { correct: number; total: number }>();
  let correct = 0;
  let unanswered = 0;

  for (const q of attempt.questions) {
    const selected = attempt.answers[q.id];
    const bucket = byDomain.get(q.domain) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (!selected || selected.length === 0) {
      perQuestion[q.id] = 'unanswered';
      unanswered += 1;
    } else if (isExactMatch(q, selected)) {
      perQuestion[q.id] = 'correct';
      correct += 1;
      bucket.correct += 1;
    } else {
      perQuestion[q.id] = 'incorrect';
    }
    byDomain.set(q.domain, bucket);
  }

  const total = attempt.questions.length;
  const domainResults: DomainResult[] = domains.map((d) => {
    const b = byDomain.get(d.id);
    return {
      domain: d.id,
      name: d.name,
      correct: b?.correct ?? 0,
      total: b?.total ?? 0,
      percent: b && b.total > 0 ? Math.round((b.correct / b.total) * 100) : null,
    };
  });

  return {
    correct,
    incorrect: total - correct - unanswered,
    unanswered,
    total,
    percent: total > 0 ? Math.round((correct / total) * 1000) / 10 : 0,
    passed: isPassing(correct, total),
    elapsedMs,
    reason,
    domains: domainResults,
    perQuestion,
  };
}

/** Domains below the practice benchmark that were actually assessed. */
export function weakDomains(result: AttemptResult): DomainResult[] {
  return result.domains.filter((d) => d.percent !== null && d.percent < PASS_PERCENT);
}
