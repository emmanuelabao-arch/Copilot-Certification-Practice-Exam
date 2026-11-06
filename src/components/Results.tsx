import { DOMAINS } from '../data/domains';
import { PASS_PERCENT } from '../lib/config';
import { weakDomains } from '../lib/scoring';
import { formatDuration } from '../lib/timer';
import type { Attempt } from '../lib/types';
import { hrefFor } from '../state/router';

export function Results({ attempt }: { attempt: Attempt }) {
  const r = attempt.result!;
  const weak = weakDomains(r);
  const passCount = Math.ceil((r.total * PASS_PERCENT) / 100);

  return (
    <>
      <h1 tabIndex={-1}>Results</h1>
      {r.reason === 'timeout' && (
        <p className="alert alert-warn" role="status">
          Time expired. Your exam was submitted automatically with the answers you had saved.
        </p>
      )}
      <section className={`card score ${r.passed ? 'pass' : 'fail'}`} aria-labelledby="score-heading">
        <h2 id="score-heading">
          {r.correct} / {r.total} ({r.percent}%) — {r.passed ? 'Pass' : 'Not yet passing'}
        </h2>
        <p className="muted">
          Practice benchmark: {PASS_PERCENT}% ({passCount}/{r.total}). This is an app benchmark, not the official
          scaled passing score.
        </p>
        <dl className="stats">
          <div>
            <dt>Correct</dt>
            <dd>{r.correct}</dd>
          </div>
          <div>
            <dt>Incorrect</dt>
            <dd>{r.incorrect}</dd>
          </div>
          <div>
            <dt>Unanswered</dt>
            <dd>{r.unanswered}</dd>
          </div>
          <div>
            <dt>Time taken</dt>
            <dd>{formatDuration(r.elapsedMs)}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{attempt.mode === 'timed' ? 'Timed exam' : 'Study mode'}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>{r.reason === 'timeout' ? 'Automatically (time expired)' : 'Manually'}</dd>
          </div>
        </dl>
        <div className="actions">
          <a className="btn btn-primary" href={hrefFor({ name: 'review', id: attempt.id })}>
            Review answers
          </a>
          <a className="btn" href={hrefFor({ name: 'home' })}>
            Start a new attempt
          </a>
        </div>
      </section>

      <section className="card" aria-labelledby="domains-heading">
        <h2 id="domains-heading">Results by domain</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Domain</th>
                <th scope="col">Official weight</th>
                <th scope="col">Correct</th>
                <th scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {r.domains.map((d) => (
                <tr key={d.domain}>
                  <th scope="row">{d.name}</th>
                  <td>{DOMAINS.find((x) => x.id === d.domain)?.officialWeight}</td>
                  <td>{d.total > 0 ? `${d.correct}/${d.total}` : '—'}</td>
                  <td>{d.percent === null ? 'Not assessed' : `${d.percent}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="weak-heading">
        <h2 id="weak-heading">Areas to study</h2>
        {weak.length === 0 ? (
          <p>No domain scored below {PASS_PERCENT}%. Review any incorrect answers to keep improving.</p>
        ) : (
          <ul className="weak-list">
            {weak.map((d) => {
              const domain = DOMAINS.find((x) => x.id === d.domain);
              return (
                <li key={d.domain}>
                  <strong>
                    {d.name} ({d.percent}%)
                  </strong>
                  <ul>
                    {domain?.studyResources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.title}
                          <span className="visually-hidden"> (opens in new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
