import type { Domain, Question } from './types';

const QUESTION_TYPES = new Set(['single', 'multiple']);

/** Returns a list of human-readable problems; empty when the bank is valid. */
export function validateQuestionBank(
  questions: unknown,
  domains: readonly Domain[],
  minQuestions: number,
): string[] {
  const errors: string[] = [];
  if (!Array.isArray(questions)) {
    return ['Question bank is missing or is not an array.'];
  }
  const domainIds = new Set(domains.map((d) => d.id));
  const ids = new Set<string>();
  const prompts = new Set<string>();

  questions.forEach((raw, index) => {
    const q = raw as Partial<Question>;
    const label = typeof q?.id === 'string' && q.id ? q.id : `#${index + 1}`;
    const err = (msg: string) => errors.push(`${label}: ${msg}`);

    if (!q || typeof q !== 'object') return err('is not an object');
    if (typeof q.id !== 'string' || !q.id.trim()) err('missing id');
    else if (ids.has(q.id)) err('duplicate question id');
    else ids.add(q.id);

    if (typeof q.prompt !== 'string' || !q.prompt.trim()) err('missing prompt');
    else {
      const key = q.prompt.trim().toLowerCase();
      if (prompts.has(key)) err('duplicate prompt text');
      prompts.add(key);
    }
    if (!q.type || !QUESTION_TYPES.has(q.type)) err(`invalid type "${String(q.type)}"`);
    if (!q.domain || !domainIds.has(q.domain)) err(`unknown domain "${String(q.domain)}"`);
    if (typeof q.explanation !== 'string' || !q.explanation.trim()) err('missing explanation');
    if (typeof q.referenceUrl !== 'string' || !/^https:\/\/\S+$/.test(q.referenceUrl)) {
      err('missing or non-https referenceUrl');
    }
    if (!q.provenance || (q.provenance.kind !== 'original' && q.provenance.kind !== 'adapted')) {
      err('missing provenance');
    } else if (q.provenance.kind === 'adapted' && (!q.provenance.license || !q.provenance.attribution)) {
      err('adapted question requires license and attribution');
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      err('needs at least two options');
      return;
    }
    const optionIds = new Set<string>();
    for (const opt of q.options) {
      if (!opt || typeof opt.id !== 'string' || !opt.id.trim()) err('option missing id');
      else if (optionIds.has(opt.id)) err(`duplicate option id "${opt.id}"`);
      else optionIds.add(opt.id);
      if (!opt || typeof opt.text !== 'string' || !opt.text.trim()) err(`option "${opt?.id}" missing text`);
      if (!opt || typeof opt.rationale !== 'string' || !opt.rationale.trim()) {
        err(`option "${opt?.id}" missing rationale`);
      }
    }

    if (!Array.isArray(q.correctOptionIds) || q.correctOptionIds.length === 0) {
      err('missing correctOptionIds');
      return;
    }
    if (new Set(q.correctOptionIds).size !== q.correctOptionIds.length) err('duplicate correctOptionIds');
    for (const id of q.correctOptionIds) {
      if (!optionIds.has(id)) err(`correctOptionIds references unknown option "${id}"`);
    }
    if (q.type === 'single' && q.correctOptionIds.length !== 1) {
      err('single-answer question must have exactly one correct option');
    }
    if (q.type === 'multiple' && (q.correctOptionIds.length < 2 || q.correctOptionIds.length >= q.options.length)) {
      err('multiple-answer question needs 2+ correct options and at least one distractor');
    }
  });

  if (questions.length < minQuestions) {
    errors.push(`Question bank has ${questions.length} questions; at least ${minQuestions} are required.`);
  }
  return errors;
}
