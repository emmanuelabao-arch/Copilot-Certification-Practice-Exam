import { isExactMatch } from '../lib/scoring';
import type { Question } from '../lib/types';
import { DOMAINS } from '../data/domains';

export function domainName(id: string): string {
  return DOMAINS.find((d) => d.id === id)?.name ?? id;
}

export function Provenance({ question }: { question: Question }) {
  const p = question.provenance;
  if (p.kind === 'original') {
    return (
      <p className="muted small">
        Original question by {p.author}, written from{' '}
        {p.groundedIn.map((u, i) => (
          <span key={u}>
            {i > 0 && ', '}
            <a href={u} target="_blank" rel="noopener noreferrer">
              official documentation
            </a>
          </span>
        ))}
        .
      </p>
    );
  }
  return (
    <p className="muted small">
      Adapted from{' '}
      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
        {p.source}
      </a>{' '}
      — {p.attribution}. License: {p.license}.
    </p>
  );
}

/** Per-option correctness, rationale and explanation, shown after checking or submitting. */
export function QuestionFeedback({ question, selected }: { question: Question; selected: readonly string[] }) {
  const answered = selected.length > 0;
  const correct = isExactMatch(question, selected);
  return (
    <div className={`feedback ${correct ? 'is-correct' : 'is-incorrect'}`}>
      <p className="verdict">
        <strong>{!answered ? 'Not answered' : correct ? 'Correct' : 'Incorrect'}</strong>
      </p>
      <ul className="option-feedback">
        {question.options.map((o) => {
          const isCorrect = question.correctOptionIds.includes(o.id);
          const isSelected = selected.includes(o.id);
          return (
            <li key={o.id} className={isCorrect ? 'opt-correct' : isSelected ? 'opt-wrong' : ''}>
              <div className="opt-text">
                {o.text}
                <span className="tags">
                  {isCorrect && <span className="tag tag-correct">Correct answer</span>}
                  {isSelected && <span className="tag tag-selected">Your answer</span>}
                </span>
              </div>
              <div className="rationale">{o.rationale}</div>
            </li>
          );
        })}
      </ul>
      <p>
        <strong>Explanation:</strong> {question.explanation}
      </p>
      <p className="small">
        Domain: {domainName(question.domain)} ·{' '}
        <a href={question.referenceUrl} target="_blank" rel="noopener noreferrer">
          Source documentation<span className="visually-hidden"> (opens in new tab)</span>
        </a>
      </p>
      <Provenance question={question} />
    </div>
  );
}
