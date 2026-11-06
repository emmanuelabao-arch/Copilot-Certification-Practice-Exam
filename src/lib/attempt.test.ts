import { DOMAINS } from '../data/domains';
import { BANK_VERSION, QUESTIONS } from '../data/questions';
import {
  checkAnswer,
  createAttempt,
  goTo,
  QuestionBankError,
  selectOption,
  submitAttempt,
  toggleFlag,
} from './attempt';
import { EXAM_DURATION_MS } from './config';
import type { ExamMode } from './types';

const NOW = 1_700_000_000_000;
const make = (seed = 42, mode: ExamMode = 'timed') =>
  createAttempt({ bank: QUESTIONS, bankVersion: BANK_VERSION, mode, now: NOW, seed, id: `t-${seed}` });

describe('createAttempt', () => {
  it('contains exactly 60 distinct questions', () => {
    const a = make();
    expect(a.questions).toHaveLength(60);
    expect(new Set(a.questions.map((q) => q.id)).size).toBe(60);
  });

  it('is deterministic for a seed and differs across seeds', () => {
    const ids = (s: number) => make(s).questions.map((q) => q.id);
    expect(ids(7)).toEqual(ids(7));
    expect(ids(7)).not.toEqual(ids(8));
  });

  it('preserves order after a JSON round trip (reload)', () => {
    const a = make(99);
    const restored = JSON.parse(JSON.stringify(a)) as typeof a;
    expect(restored.questions.map((q) => q.id)).toEqual(a.questions.map((q) => q.id));
    expect(restored.questions[0]!.options.map((o) => o.id)).toEqual(a.questions[0]!.options.map((o) => o.id));
  });

  it('shuffles options without changing correct option IDs', () => {
    const a = make(123);
    for (const q of a.questions) {
      const original = QUESTIONS.find((x) => x.id === q.id)!;
      expect(q.correctOptionIds).toEqual(original.correctOptionIds);
      expect([...q.options.map((o) => o.id)].sort()).toEqual(original.options.map((o) => o.id).sort());
      for (const o of q.options) expect(o.text).toBe(original.options.find((x) => x.id === o.id)!.text);
    }
  });

  it('keeps option order when shuffleOptions is false', () => {
    const bank = QUESTIONS.map((q) => ({ ...q, shuffleOptions: false }));
    const a = createAttempt({ bank, bankVersion: 'x', mode: 'timed', now: NOW, seed: 5, id: 'x' });
    for (const q of a.questions) {
      expect(q.options.map((o) => o.id)).toEqual(QUESTIONS.find((x) => x.id === q.id)!.options.map((o) => o.id));
    }
  });

  it('sets a 100 minute deadline in timed mode and none in study mode', () => {
    expect(make(1, 'timed').deadline).toBe(NOW + EXAM_DURATION_MS);
    expect(make(1, 'study').deadline).toBeNull();
  });

  it('throws an actionable error for an undersized or duplicate bank', () => {
    expect(() => createAttempt({ bank: QUESTIONS.slice(0, 59), bankVersion: 'x', mode: 'timed', now: NOW, seed: 1, id: 'x' })).toThrow(QuestionBankError);
    const dupes = [...QUESTIONS.slice(0, 59), QUESTIONS[0]!];
    expect(() => createAttempt({ bank: dupes, bankVersion: 'x', mode: 'timed', now: NOW, seed: 1, id: 'x' })).toThrow(/59 unique/);
  });
});

describe('answering', () => {
  it('single-answer questions keep one selection', () => {
    let a = make();
    const q = a.questions.find((x) => x.type === 'single')!;
    a = selectOption(a, q.id, q.options[0]!.id);
    a = selectOption(a, q.id, q.options[1]!.id);
    expect(a.answers[q.id]).toEqual([q.options[1]!.id]);
  });

  it('multiple-answer questions toggle selections', () => {
    let a = make();
    const q = a.questions.find((x) => x.type === 'multiple')!;
    a = selectOption(a, q.id, q.options[0]!.id);
    a = selectOption(a, q.id, q.options[1]!.id);
    expect(a.answers[q.id]).toHaveLength(2);
    a = selectOption(a, q.id, q.options[0]!.id);
    a = selectOption(a, q.id, q.options[1]!.id);
    expect(a.answers[q.id]).toBeUndefined();
  });

  it('ignores unknown option IDs', () => {
    const a = make();
    expect(selectOption(a, a.questions[0]!.id, 'nope')).toBe(a);
  });

  it('flags and unflags', () => {
    let a = make();
    const id = a.questions[3]!.id;
    a = toggleFlag(a, id);
    expect(a.flags).toEqual([id]);
    a = toggleFlag(a, id);
    expect(a.flags).toEqual([]);
  });

  it('keeps selections while navigating and clamps the index', () => {
    let a = make();
    const id = a.questions[0]!.id;
    a = selectOption(a, id, a.questions[0]!.options[0]!.id);
    a = goTo(a, 5);
    a = goTo(a, 0);
    expect(a.answers[id]).toHaveLength(1);
    expect(goTo(a, 999).currentIndex).toBe(59);
    expect(goTo(a, -3).currentIndex).toBe(0);
  });

  it('study mode check locks the answer; timed mode cannot check', () => {
    let s = make(1, 'study');
    const q = s.questions[0]!;
    s = selectOption(s, q.id, q.options[0]!.id);
    s = checkAnswer(s, q.id);
    expect(s.checked).toEqual([q.id]);
    expect(selectOption(s, q.id, q.options[1]!.id)).toBe(s);

    const t = make(1, 'timed');
    expect(checkAnswer(t, t.questions[0]!.id)).toBe(t);
  });
});

describe('submitAttempt', () => {
  it('is immutable after submission', () => {
    const a = submitAttempt(make(), 'manual', NOW + 1000, DOMAINS);
    const q = a.questions[0]!;
    expect(selectOption(a, q.id, q.options[0]!.id)).toBe(a);
    expect(toggleFlag(a, q.id)).toBe(a);
    expect(submitAttempt(a, 'timeout', NOW + 5000, DOMAINS)).toBe(a);
  });

  it('records timeout at the deadline, not the late wake-up time', () => {
    const a = make();
    const done = submitAttempt(a, 'timeout', a.deadline! + 3_600_000, DOMAINS);
    expect(done.submittedAt).toBe(a.deadline);
    expect(done.result!.elapsedMs).toBe(EXAM_DURATION_MS);
    expect(done.result!.reason).toBe('timeout');
  });
});
