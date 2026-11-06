import { useState } from 'react';
import type { Attempt } from '../lib/types';
import { hrefFor } from '../state/router';
import { domainName, QuestionFeedback } from './Feedback';

type Filter = 'all' | 'correct' | 'incorrect' | 'unanswered' | 'flagged';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'correct', label: 'Correct' },
  { id: 'incorrect', label: 'Incorrect' },
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'flagged', label: 'Flagged' },
];

export function Review({ attempt }: { attempt: Attempt }) {
  const [filter, setFilter] = useState<Filter>('all');
  const r = attempt.result!;
  const matches = (id: string, f: Filter) =>
    f === 'all' ? true : f === 'flagged' ? attempt.flags.includes(id) : r.perQuestion[id] === f;
  const count = (f: Filter) => attempt.questions.filter((q) => matches(q.id, f)).length;
  const visible = attempt.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => matches(q.id, filter));

  return (
    <>
      <h1 tabIndex={-1}>Review answers</h1>
      <p>
        <a href={hrefFor({ name: 'results', id: attempt.id })}>← Back to results</a> ·{' '}
        <a href={hrefFor({ name: 'sources' })}>Sources and attribution</a>
      </p>
      <div className="filters" role="group" aria-label="Filter questions">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="btn btn-small"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label} ({count(f.id)})
          </button>
        ))}
      </div>
      <p role="status" className="muted">
        Showing {visible.length} of {attempt.questions.length} questions.
      </p>
      <ol className="review-list">
        {visible.map(({ q, i }) => (
          <li key={q.id} className="card">
            <h2 className="review-title">
              Question {i + 1} <span className="muted small">({q.id})</span>
              {attempt.flags.includes(q.id) && <span className="tag">Flagged</span>}
            </h2>
            <p className="small muted">
              {domainName(q.domain)} · {q.type === 'multiple' ? `Select ${q.correctOptionIds.length}` : 'Select one'}
            </p>
            <p className="question-prompt">{q.prompt}</p>
            <QuestionFeedback question={q} selected={attempt.answers[q.id] ?? []} />
          </li>
        ))}
      </ol>
    </>
  );
}
