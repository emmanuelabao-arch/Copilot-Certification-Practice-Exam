import { useState } from 'react';
import { BANK_VERSION, QUESTIONS } from '../data/questions';
import { createAttempt, answeredCount, QuestionBankError } from '../lib/attempt';
import { EXAM_DURATION_MS, PASS_PERCENT, QUESTIONS_PER_EXAM } from '../lib/config';
import { randomSeed } from '../lib/random';
import { clearHistory, discardActive, startNew } from '../lib/state';
import { formatDuration } from '../lib/timer';
import type { ExamMode } from '../lib/types';
import { hrefFor, navigate } from '../state/router';
import type { ExamStore } from '../state/useExamStore';
import { ConfirmDialog } from './ConfirmDialog';

const PASS_COUNT = Math.ceil((QUESTIONS_PER_EXAM * PASS_PERCENT) / 100);
const MINUTES = EXAM_DURATION_MS / 60_000;

function newAttemptId(): string {
  return `att-${Date.now().toString(36)}-${randomSeed().toString(36)}`;
}

export function Home({ store, bankErrors }: { store: ExamStore; bankErrors: string[] }) {
  const { state, isOwner, commit } = store;
  const [mode, setMode] = useState<ExamMode>('timed');
  const [startError, setStartError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'discard' | 'clear' | null>(null);

  const active = state?.activeAttempt ?? null;
  const history = state?.history ?? [];
  const bankInvalid = bankErrors.length > 0;

  const start = () => {
    setStartError(null);
    try {
      const attempt = createAttempt({
        bank: QUESTIONS,
        bankVersion: BANK_VERSION,
        mode,
        now: Date.now(),
        seed: randomSeed(),
        id: newAttemptId(),
      });
      if (commit((s) => startNew(s, attempt))) navigate({ name: 'exam' });
    } catch (e) {
      setStartError(e instanceof QuestionBankError ? e.message : `Could not start the exam: ${(e as Error).message}`);
    }
  };

  return (
    <>
      <h1 tabIndex={-1}>GitHub Copilot (GH-300) Practice Exam</h1>
      <p className="notice" role="note">
        <strong>Unofficial learning tool.</strong> This app is not affiliated with, endorsed by, or a simulator of
        the official GitHub/Microsoft exam, and passing here does not guarantee certification success.
      </p>

      <section aria-labelledby="about-heading" className="card">
        <h2 id="about-heading">About this practice exam</h2>
        <ul className="facts">
          <li>
            <strong>{QUESTIONS_PER_EXAM} questions</strong> per attempt, drawn from a bank of {QUESTIONS.length}{' '}
            original questions aligned to the GH-300 skills outline, in a new random order each time.
          </li>
          <li>
            <strong>Timed mode:</strong> {MINUTES}-minute countdown that cannot be paused. This is an app default,
            not a claim about the official exam duration.
          </li>
          <li>
            <strong>Study mode:</strong> untimed, with a "Check answer" button that reveals explanations as you go.
          </li>
          <li>
            <strong>Practice benchmark:</strong> {PASS_PERCENT}% ({PASS_COUNT}/{QUESTIONS_PER_EXAM}). This is an app
            benchmark only and is not equivalent to the official scaled passing score.
          </li>
          <li>No account, payment, or personal information required.</li>
        </ul>
      </section>

      {bankInvalid && (
        <div className="alert alert-error" role="alert">
          <h2>The question bank is invalid</h2>
          <p>An exam cannot start until these problems are fixed (run <code>npm run validate:questions</code>):</p>
          <ul>
            {bankErrors.slice(0, 10).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {active ? (
        <section aria-labelledby="resume-heading" className="card">
          <h2 id="resume-heading">You have an unfinished attempt</h2>
          <p>
            {active.mode === 'timed' ? 'Timed exam' : 'Study mode'} started{' '}
            {new Date(active.startedAt).toLocaleString()} — {answeredCount(active)} of {active.questions.length}{' '}
            answered.
          </p>
          <div className="actions">
            <a className="btn btn-primary" href={hrefFor({ name: 'exam' })}>
              Resume attempt
            </a>
            <button type="button" className="btn btn-danger" disabled={!isOwner} onClick={() => setConfirm('discard')}>
              Discard and start again
            </button>
          </div>
        </section>
      ) : (
        <section aria-labelledby="start-heading" className="card">
          <h2 id="start-heading">Start a new attempt</h2>
          <fieldset className="mode-select">
            <legend>Choose a mode</legend>
            <label className="choice">
              <input type="radio" name="mode" value="timed" checked={mode === 'timed'} onChange={() => setMode('timed')} />
              <span>
                <strong>Timed exam</strong> — {MINUTES}:00 countdown, answers and explanations shown after submission.
              </span>
            </label>
            <label className="choice">
              <input type="radio" name="mode" value="study" checked={mode === 'study'} onChange={() => setMode('study')} />
              <span>
                <strong>Study mode</strong> — no time limit, check each answer as you go.
              </span>
            </label>
          </fieldset>
          {startError && (
            <p className="alert alert-error" role="alert">
              {startError}
            </p>
          )}
          <button type="button" className="btn btn-primary" disabled={bankInvalid || !isOwner} onClick={start}>
            Start {mode === 'timed' ? 'timed exam' : 'study mode'}
          </button>
        </section>
      )}

      <section aria-labelledby="instructions-heading" className="card">
        <h2 id="instructions-heading">Instructions</h2>
        <ul>
          <li>
            <strong>Single-answer</strong> questions use round buttons; pick one. <strong>Multiple-answer</strong>{' '}
            questions use checkboxes and state how many to choose.
          </li>
          <li>
            <strong>Scoring:</strong> each question is worth one point. Multiple-answer questions score only when
            your selection exactly matches the correct set. Partially correct, incorrect, and unanswered questions
            score zero, so answer every question.
          </li>
          <li>
            <strong>Navigation:</strong> use Previous/Next or the question navigator to move freely. Flag questions
            to revisit them. Your selections are kept as you move.
          </li>
          <li>
            <strong>Submission:</strong> select "Submit exam" and confirm. In timed mode the exam submits
            automatically when time runs out. Submitted attempts cannot be changed.
          </li>
          <li>
            <strong>Saving:</strong> progress is saved in this browser as you go, so you can reload or come back
            later. Timed attempts keep counting down while the page is closed.
          </li>
        </ul>
      </section>

      <section aria-labelledby="history-heading" className="card">
        <h2 id="history-heading">Your history</h2>
        {history.length === 0 ? (
          <p>No completed attempts yet.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <caption className="visually-hidden">Completed attempts, newest first</caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Mode</th>
                    <th scope="col">Score</th>
                    <th scope="col">Duration</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((a) => (
                    <tr key={a.id}>
                      <td>{new Date(a.submittedAt ?? a.startedAt).toLocaleString()}</td>
                      <td>{a.mode === 'timed' ? 'Timed' : 'Study'}</td>
                      <td>
                        {a.result?.correct}/{a.result?.total} ({a.result?.percent}%){' '}
                        {a.result?.passed ? 'Pass' : 'Not yet'}
                      </td>
                      <td>{formatDuration(a.result?.elapsedMs ?? 0)}</td>
                      <td>
                        <a href={hrefFor({ name: 'results', id: a.id })}>
                          Results<span className="visually-hidden"> for attempt on {new Date(a.startedAt).toLocaleString()}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn" disabled={!isOwner} onClick={() => setConfirm('clear')}>
              Clear history
            </button>
          </>
        )}
        <p className="muted">
          History and in-progress attempts are stored only in this browser on this device (localStorage). Nothing is
          sent to a server. Clearing site data or using a different browser or device removes or hides them.
        </p>
      </section>

      {confirm === 'discard' && (
        <ConfirmDialog
          title="Discard unfinished attempt?"
          confirmLabel="Discard attempt"
          destructive
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            commit(discardActive);
            setConfirm(null);
          }}
        >
          <p>Your answers in the unfinished attempt will be permanently deleted. Completed history is not affected.</p>
        </ConfirmDialog>
      )}
      {confirm === 'clear' && (
        <ConfirmDialog
          title="Clear all history?"
          confirmLabel="Clear history"
          destructive
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            commit(clearHistory);
            setConfirm(null);
          }}
        >
          <p>All {history.length} completed attempts will be permanently deleted from this browser.</p>
        </ConfirmDialog>
      )}
    </>
  );
}
