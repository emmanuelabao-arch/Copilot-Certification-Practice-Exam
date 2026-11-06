export type QuestionType = 'single' | 'multiple';

export type DomainId =
  | 'responsible-ai'
  | 'copilot-features'
  | 'data-architecture'
  | 'prompt-engineering'
  | 'developer-productivity'
  | 'privacy-safeguards';

export interface Domain {
  id: DomainId;
  name: string;
  /** Official weighting range from the GH-300 study guide, e.g. "15–20%". */
  officialWeight: string;
  studyResources: { title: string; url: string }[];
}

export interface QuestionOption {
  id: string;
  text: string;
  /** Why this option is correct or why it is a distractor. */
  rationale: string;
}

export type Provenance =
  | { kind: 'original'; author: string; groundedIn: string[] }
  | { kind: 'adapted'; source: string; sourceUrl: string; license: string; attribution: string };

export interface Question {
  id: string;
  type: QuestionType;
  domain: DomainId;
  prompt: string;
  options: QuestionOption[];
  correctOptionIds: string[];
  explanation: string;
  referenceUrl: string;
  provenance: Provenance;
  /** Set to false when option order matters (e.g. "Both A and B"). Defaults to true. */
  shuffleOptions?: boolean;
}

export type ExamMode = 'timed' | 'study';
export type SubmitReason = 'manual' | 'timeout';

export interface DomainResult {
  domain: DomainId;
  name: string;
  correct: number;
  total: number;
  /** null when no question from this domain was in the attempt. */
  percent: number | null;
}

export interface AttemptResult {
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  percent: number;
  passed: boolean;
  elapsedMs: number;
  reason: SubmitReason;
  domains: DomainResult[];
  perQuestion: Record<string, 'correct' | 'incorrect' | 'unanswered'>;
}

export interface Attempt {
  id: string;
  bankVersion: string;
  mode: ExamMode;
  seed: number;
  startedAt: number;
  /** Absolute epoch ms; null in study mode. */
  deadline: number | null;
  /** Snapshot of the questions as shown, in attempt order with options in display order. */
  questions: Question[];
  answers: Record<string, string[]>;
  flags: string[];
  /** Study mode: question IDs whose answers have been checked (and are locked). */
  checked: string[];
  currentIndex: number;
  /** Last timer warning threshold (minutes) already announced. */
  lastWarning: number | null;
  status: 'in-progress' | 'submitted';
  submittedAt?: number;
  result?: AttemptResult;
}

export interface PersistedState {
  schemaVersion: number;
  activeAttempt: Attempt | null;
  history: Attempt[];
}
