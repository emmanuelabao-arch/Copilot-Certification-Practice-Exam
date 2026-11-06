import { useEffect, useRef, useState } from 'react';
import { answeredCount, checkAnswer, goTo, isLocked, selectOption, toggleFlag } from '../lib/attempt';
import { updateActive } from '../lib/state';
import { formatClock, nextWarning, remainingMs } from '../lib/timer';
import type { Attempt } from '../lib/types';
import { hrefFor, navigate } from '../state/router';
import type { ExamStore } from '../state/useExamStore';
import { ConfirmDialog } from './ConfirmDialog';
import { QuestionFeedback } from './Feedback';

function useNow(enabled: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [enabled]);
  return now;
}

export function ExamView({ store }: { store: ExamStore }) {
  const { state, isOwner, commit, submit } = store;
  const active = state?.activeAttempt ?? null;
  const timed = active?.deadline != null;
  const now = useNow(timed);
  const [politeMsg, setPoliteMsg] = useState('');
  const [urgentMsg, setUrgentMsg] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const remaining = active?.deadline != null ? remainingMs(active.deadline, now) : null;

  useEffect(() => {
    if (!active || active.deadline === null || !isOwner) return;
    const warning = nextWarning(remainingMs(active.deadline, now), active.lastWarning);
    if (warning === null) return;
    const msg = warning === 1 ? 'Warning: 1 minute remaining.' : `${warning} minutes remaining.`;
    if (warning <= 1) setUrgentMsg(msg);
    else setPoliteMsg(msg);
    commit((s) => updateActive(s, (a) => ({ ...a, lastWarning: warning })));
  }, [now, active, isOwner, commit]);

  const currentIndex = active?.currentIndex ?? 0;
  useEffect(() => {
    headingRef.current?.focus();
  }, [currentIndex]);

  if (!active) {
    return (
      <>
        <h1 tabIndex={-1}>No exam in progress</h1>
        <p>There is no unfinished attempt in this browser.</p>
        <a className="btn btn-primary" href={hrefFor({ name: 'home' })}>
          Go to start page
        </a>
      </>
    );
  }

  const readOnly = !isOwner;
  const update = (fn: (a: Attempt) => Attempt) => commit((s) => updateActive(s, fn));
  const question = active.questions[active.currentIndex] ?? active.questions[0]!;
  const selected = active.answers[question.id] ?? [];
  const locked = readOnly || isLocked(active, question.id);
  const checked = active.checked.includes(question.id);
  const flagged = active.flags.includes(question.id);
  const total = active.questions.length;
  const answered = answeredCount(active);
  const required = question.correctOptionIds.length;
  const lowTime = remaining !== null && remaining <= 10 * 60_000;

  const confirmSubmit = () => {
    setConfirmOpen(false);
    const done = submit('manual');
    if (done) navigate({ name: 'results', id: done.id });
  };

  return (
    <div className="exam">
      <div className="exam-header">
        <div>
          <p className="eyebrow">{active.mode === 'timed' ? 'Timed exam' : 'Study mode (untimed)'}</p>
          <p className="progress" aria-live="off">
            {answered} answered / {total - answered} unanswered
          </p>
        </div>
        {remaining !== null && (
          <div className={`timer ${lowTime ? 'timer-low' : ''}`} role="timer" aria-label="Time remaining">
            <span className="visually-hidden">Time remaining: </span>
            <span aria-hidden="true">⏱ </span>
            {formatClock(remaining)}
            {lowTime && <span className="timer-note"> — less than 10 minutes left</span>}
          </div>
        )}
      </div>
      <div className="visually-hidden" aria-live="polite" role="status">
        {politeMsg}
      </div>
      <div className="visually-hidden" aria-live="assertive" role="alert">
        {urgentMsg}
      </div>

      <div className="exam-body">
        <section className="question card" aria-labelledby="question-heading">
          <h1 id="question-heading" ref={headingRef} tabIndex={-1} className="question-number">
            Question {active.currentIndex + 1} of {total}
            {flagged && <span className="flag-label"> (flagged)</span>}
          </h1>
          <fieldset disabled={locked}>
            <legend className="question-prompt">{question.prompt}</legend>
            <p className="hint" id={`hint-${question.id}`}>
              {question.type === 'multiple' ? `Select ${required} answers.` : 'Select one answer.'}
            </p>
            <div className="options">
              {question.options.map((o) => (
                <label key={o.id} className={`choice ${selected.includes(o.id) ? 'selected' : ''}`}>
                  <input
                    type={question.type === 'single' ? 'radio' : 'checkbox'}
                    name={`q-${question.id}`}
                    value={o.id}
                    checked={selected.includes(o.id)}
                    aria-describedby={`hint-${question.id}`}
                    onChange={() => update((a) => selectOption(a, question.id, o.id))}
                  />
                  <span>{o.text}</span>
                </label>
              ))}
            </div>
            {question.type === 'multiple' && selected.length > required && (
              <p className="alert alert-warn" role="status">
                You have selected {selected.length} answers; this question needs exactly {required}.
              </p>
            )}
          </fieldset>

          {active.mode === 'study' && (
            <div className="study-check">
              {!checked ? (
                <button
                  type="button"
                  className="btn"
                  disabled={readOnly || selected.length === 0}
                  onClick={() => update((a) => checkAnswer(a, question.id))}
                >
                  Check answer
                </button>
              ) : (
                <QuestionFeedback question={question} selected={selected} />
              )}
            </div>
          )}

          <div className="question-actions">
            <button
              type="button"
              className="btn"
              disabled={readOnly || active.currentIndex === 0}
              onClick={() => update((a) => goTo(a, a.currentIndex - 1))}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="btn"
              aria-pressed={flagged}
              disabled={readOnly}
              onClick={() => update((a) => toggleFlag(a, question.id))}
            >
              {flagged ? '⚑ Unflag' : '⚐ Flag for review'}
            </button>
            <button
              type="button"
              className="btn"
              disabled={readOnly || active.currentIndex === total - 1}
              onClick={() => update((a) => goTo(a, a.currentIndex + 1))}
            >
              Next →
            </button>
          </div>
        </section>

        <aside className="card navigator-panel" aria-labelledby="navigator-heading">
          <h2 id="navigator-heading">Questions</h2>
          <nav aria-label="Question navigator">
            <ol className="navigator">
              {active.questions.map((q, i) => {
                const isAnswered = (active.answers[q.id]?.length ?? 0) > 0;
                const isFlagged = active.flags.includes(q.id);
                const isCurrent = i === active.currentIndex;
                const label = `Question ${i + 1}, ${isAnswered ? 'answered' : 'unanswered'}${isFlagged ? ', flagged' : ''}`;
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      className={['nav-item', isAnswered && 'answered', isFlagged && 'flagged', isCurrent && 'current']
                        .filter(Boolean)
                        .join(' ')}
                      aria-label={label}
                      aria-current={isCurrent ? 'step' : undefined}
                      disabled={readOnly}
                      onClick={() => update((a) => goTo(a, i))}
                    >
                      <span aria-hidden="true">
                        {i + 1}
                        {isAnswered ? '•' : ''}
                        {isFlagged ? '⚑' : ''}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <p className="legend small">
            <span>
              <b>•</b> answered
            </span>
            <span>
              <b>⚑</b> flagged
            </span>
            <span>
              <b className="legend-current">n</b> current
            </span>
            <span>plain = unanswered</span>
          </p>
          <button type="button" className="btn btn-primary submit" disabled={readOnly} onClick={() => setConfirmOpen(true)}>
            Submit exam
          </button>
        </aside>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          title="Submit your exam?"
          confirmLabel="Submit exam"
          cancelLabel="Return to exam"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmSubmit}
        >
          <p>
            You have answered <strong>{answered}</strong> of {total} questions.{' '}
            {total - answered > 0 && (
              <>
                <strong>{total - answered}</strong> unanswered question{total - answered === 1 ? '' : 's'} will score
                zero.{' '}
              </>
            )}
            {active.flags.length > 0 && <>{active.flags.length} question(s) are flagged for review. </>}
          </p>
          <p>After submitting you cannot change your answers.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}
