import { DOMAINS } from '../data/domains';
import { QUESTIONS } from '../data/questions';
import { QUESTIONS_PER_EXAM } from './config';
import type { Question } from './types';
import { validateQuestionBank } from './validate';

const valid = (): Question => structuredClone(QUESTIONS[0]!);
const validate = (qs: unknown, min = 1) => validateQuestionBank(qs, DOMAINS, min);

describe('bundled question bank', () => {
  it('passes validation with at least 60 questions', () => {
    expect(validateQuestionBank(QUESTIONS, DOMAINS, QUESTIONS_PER_EXAM)).toEqual([]);
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(60);
  });

  it('has unique IDs and unique prompts', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    expect(new Set(QUESTIONS.map((q) => q.prompt.toLowerCase())).size).toBe(QUESTIONS.length);
  });

  it('covers every GH-300 domain', () => {
    for (const d of DOMAINS) expect(QUESTIONS.some((q) => q.domain === d.id)).toBe(true);
  });

  it('has a rationale for every option and https references', () => {
    for (const q of QUESTIONS) {
      expect(q.referenceUrl).toMatch(/^https:\/\//);
      for (const o of q.options) expect(o.rationale.length).toBeGreaterThan(10);
    }
  });
});

describe('validateQuestionBank', () => {
  it('rejects non-array input', () => {
    expect(validate(undefined)).toEqual(['Question bank is missing or is not an array.']);
  });

  it('rejects an undersized bank', () => {
    expect(validate([valid()], 60).join()).toMatch(/at least 60/);
  });

  it('rejects duplicate question IDs', () => {
    const b = { ...valid(), prompt: 'Different prompt?' };
    expect(validate([valid(), b]).join()).toMatch(/duplicate question id/);
  });

  it('rejects missing required fields', () => {
    const q = valid() as Partial<Question>;
    delete q.explanation;
    delete q.referenceUrl;
    const errors = validate([q]).join();
    expect(errors).toMatch(/missing explanation/);
    expect(errors).toMatch(/referenceUrl/);
  });

  it('rejects invalid answer references', () => {
    const q = { ...valid(), correctOptionIds: ['zzz'] };
    expect(validate([q]).join()).toMatch(/unknown option "zzz"/);
  });

  it('rejects duplicate option IDs', () => {
    const q = valid();
    q.options[1]!.id = q.options[0]!.id;
    expect(validate([q]).join()).toMatch(/duplicate option id/);
  });

  it('rejects single questions with multiple answers', () => {
    const q = valid();
    q.type = 'single';
    q.correctOptionIds = [q.options[0]!.id, q.options[1]!.id];
    expect(validate([q]).join()).toMatch(/exactly one correct/);
  });

  it('rejects multiple-answer questions with fewer than two answers or no distractor', () => {
    const one = { ...valid(), type: 'multiple' as const, correctOptionIds: ['a'] };
    expect(validate([one]).join()).toMatch(/multiple-answer/);
    const all = { ...valid(), type: 'multiple' as const, correctOptionIds: ['a', 'b', 'c', 'd'] };
    expect(validate([all]).join()).toMatch(/multiple-answer/);
  });

  it('rejects unknown domains and missing option rationale', () => {
    const q = valid();
    (q as { domain: string }).domain = 'nope';
    q.options[0]!.rationale = '';
    const errors = validate([q]).join();
    expect(errors).toMatch(/unknown domain/);
    expect(errors).toMatch(/missing rationale/);
  });

  it('requires attribution for adapted questions', () => {
    const q: Question = {
      ...valid(),
      provenance: { kind: 'adapted', source: 'X', sourceUrl: 'https://x', license: '', attribution: '' },
    };
    expect(validate([q]).join()).toMatch(/license and attribution/);
  });
});
