import { EXAM_DURATION_MS, QUESTIONS_PER_EXAM } from './config';
import { mulberry32, shuffle } from './random';
import { scoreAttempt } from './scoring';
import type { Attempt, Domain, ExamMode, Question, SubmitReason } from './types';

export class QuestionBankError extends Error {}

export interface CreateAttemptInput {
  bank: readonly Question[];
  bankVersion: string;
  mode: ExamMode;
  now: number;
  seed: number;
  id: string;
  count?: number;
}

export function createAttempt({
  bank,
  bankVersion,
  mode,
  now,
  seed,
  id,
  count = QUESTIONS_PER_EXAM,
}: CreateAttemptInput): Attempt {
  const uniqueIds = new Set(bank.map((q) => q.id));
  if (uniqueIds.size < count) {
    throw new QuestionBankError(
      `The question bank has ${uniqueIds.size} unique questions but an exam needs ${count}. ` +
        'Add questions or fix duplicates, then run "npm run validate:questions".',
    );
  }
  const rand = mulberry32(seed);
  const seen = new Set<string>();
  const deduped = bank.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
  const selected = shuffle(deduped, rand).slice(0, count);
  const questions = selected.map((q) => ({
    ...q,
    options: q.shuffleOptions === false ? [...q.options] : shuffle(q.options, rand),
  }));

  return {
    id,
    bankVersion,
    mode,
    seed,
    startedAt: now,
    deadline: mode === 'timed' ? now + EXAM_DURATION_MS : null,
    questions: structuredClone(questions),
    answers: {},
    flags: [],
    checked: [],
    currentIndex: 0,
    lastWarning: null,
    status: 'in-progress',
  };
}

export function isLocked(attempt: Attempt, questionId: string): boolean {
  return attempt.status !== 'in-progress' || attempt.checked.includes(questionId);
}

export function selectOption(attempt: Attempt, questionId: string, optionId: string): Attempt {
  if (isLocked(attempt, questionId)) return attempt;
  const question = attempt.questions.find((q) => q.id === questionId);
  if (!question || !question.options.some((o) => o.id === optionId)) return attempt;
  const current = attempt.answers[questionId] ?? [];
  let next: string[];
  if (question.type === 'single') {
    next = [optionId];
  } else if (current.includes(optionId)) {
    next = current.filter((id) => id !== optionId);
  } else {
    next = [...current, optionId];
  }
  const answers = { ...attempt.answers };
  if (next.length) answers[questionId] = next;
  else delete answers[questionId];
  return { ...attempt, answers };
}

export function toggleFlag(attempt: Attempt, questionId: string): Attempt {
  if (attempt.status !== 'in-progress') return attempt;
  const flags = attempt.flags.includes(questionId)
    ? attempt.flags.filter((id) => id !== questionId)
    : [...attempt.flags, questionId];
  return { ...attempt, flags };
}

export function checkAnswer(attempt: Attempt, questionId: string): Attempt {
  if (attempt.mode !== 'study' || isLocked(attempt, questionId)) return attempt;
  return { ...attempt, checked: [...attempt.checked, questionId] };
}

export function goTo(attempt: Attempt, index: number): Attempt {
  const clamped = Math.max(0, Math.min(attempt.questions.length - 1, index));
  return clamped === attempt.currentIndex ? attempt : { ...attempt, currentIndex: clamped };
}

export function answeredCount(attempt: Attempt): number {
  return attempt.questions.filter((q) => (attempt.answers[q.id]?.length ?? 0) > 0).length;
}

/** Idempotent: returns the same attempt unchanged if it has already been submitted. */
export function submitAttempt(
  attempt: Attempt,
  reason: SubmitReason,
  now: number,
  domains: readonly Domain[],
): Attempt {
  if (attempt.status === 'submitted') return attempt;
  const submittedAt = reason === 'timeout' && attempt.deadline !== null ? attempt.deadline : now;
  const elapsedMs = Math.max(0, submittedAt - attempt.startedAt);
  return {
    ...attempt,
    status: 'submitted',
    submittedAt,
    result: scoreAttempt(attempt, domains, reason, elapsedMs),
  };
}
