import { DOMAINS } from '../data/domains';
import { BANK_VERSION, QUESTIONS } from '../data/questions';
import { createAttempt } from './attempt';
import { isExactMatch, isPassing, scoreAttempt, weakDomains } from './scoring';
import type { Attempt, Question } from './types';

const base = () => createAttempt({ bank: QUESTIONS, bankVersion: BANK_VERSION, mode: 'timed', now: 0, seed: 1, id: 'a' });

function answerCorrectly(a: Attempt, count: number): Attempt {
  const answers: Attempt['answers'] = {};
  a.questions.forEach((q, i) => {
    if (i < count) answers[q.id] = [...q.correctOptionIds];
    else answers[q.id] = [q.options.find((o) => !q.correctOptionIds.includes(o.id))!.id];
  });
  return { ...a, answers };
}

const multi = (): Question => QUESTIONS.find((q) => q.type === 'multiple')!;

describe('isExactMatch', () => {
  it('requires the exact correct set for multiple-answer questions', () => {
    const q = multi();
    const [c1, c2] = q.correctOptionIds as [string, string];
    const wrong = q.options.find((o) => !q.correctOptionIds.includes(o.id))!.id;
    expect(isExactMatch(q, [c2, c1])).toBe(true);
    expect(isExactMatch(q, [c1])).toBe(false);
    expect(isExactMatch(q, [c1, c2, wrong])).toBe(false);
    expect(isExactMatch(q, [c1, c1])).toBe(false);
    expect(isExactMatch(q, [])).toBe(false);
    expect(isExactMatch(q, undefined)).toBe(false);
  });
});

describe('passing boundary', () => {
  it('47/60 fails and 48/60 passes', () => {
    expect(isPassing(47, 60)).toBe(false);
    expect(isPassing(48, 60)).toBe(true);
    expect(isPassing(0, 0)).toBe(false);
  });

  it('scores a full attempt at the boundary', () => {
    expect(scoreAttempt(answerCorrectly(base(), 47), DOMAINS, 'manual', 0).passed).toBe(false);
    const r = scoreAttempt(answerCorrectly(base(), 48), DOMAINS, 'manual', 0);
    expect(r.passed).toBe(true);
    expect(r.percent).toBe(80);
    expect(r.correct).toBe(48);
    expect(r.incorrect).toBe(12);
  });
});

describe('scoreAttempt', () => {
  it('counts unanswered separately and scores them zero', () => {
    const r = scoreAttempt(base(), DOMAINS, 'timeout', 1000);
    expect(r.unanswered).toBe(60);
    expect(r.correct).toBe(0);
    expect(r.incorrect).toBe(0);
    expect(r.reason).toBe('timeout');
    expect(Object.values(r.perQuestion).every((v) => v === 'unanswered')).toBe(true);
  });

  it('gives partial multiple-answer selections zero credit', () => {
    const a = base();
    const q = a.questions.find((x) => x.type === 'multiple')!;
    const r = scoreAttempt({ ...a, answers: { [q.id]: [q.correctOptionIds[0]!] } }, DOMAINS, 'manual', 0);
    expect(r.perQuestion[q.id]).toBe('incorrect');
    expect(r.correct).toBe(0);
  });

  it('reports per-domain results and "Not assessed" (null) for absent domains', () => {
    const a = base();
    const onlyRai = { ...a, questions: a.questions.filter((q) => q.domain === 'responsible-ai') };
    const r = scoreAttempt(answerCorrectly(onlyRai, 100), DOMAINS, 'manual', 0);
    const rai = r.domains.find((d) => d.domain === 'responsible-ai')!;
    expect(rai.percent).toBe(100);
    expect(rai.correct).toBe(rai.total);
    for (const d of r.domains.filter((x) => x.domain !== 'responsible-ai')) {
      expect(d.total).toBe(0);
      expect(d.percent).toBeNull();
    }
    expect(weakDomains(r)).toEqual([]);
  });

  it('identifies weak domains below the benchmark', () => {
    const r = scoreAttempt(base(), DOMAINS, 'manual', 0);
    expect(weakDomains(r)).toHaveLength(DOMAINS.length);
  });
});
