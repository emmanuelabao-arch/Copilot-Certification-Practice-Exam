import { DOMAINS, OUTLINE_VERSION, STUDY_GUIDE_URL } from '../data/domains';
import { BANK_VERSION, QUESTIONS } from '../data/questions';
import { SOURCES } from '../data/sources';
import { hrefFor } from '../state/router';

export function Sources() {
  const total = QUESTIONS.length;
  const original = QUESTIONS.filter((q) => q.provenance.kind === 'original').length;

  return (
    <>
      <h1 tabIndex={-1}>Sources, licensing, and coverage</h1>
      <p>
        <a href={hrefFor({ name: 'home' })}>← Back to start</a>
      </p>

      <section className="card" aria-labelledby="provenance-heading">
        <h2 id="provenance-heading">Question provenance</h2>
        <p>
          Question bank version <code>{BANK_VERSION}</code>: {total} questions, {original} original and{' '}
          {total - original} adapted from licensed material. Original questions are written by project contributors
          in their own words and grounded in the linked official documentation. No leaked live-exam questions or
          exam dumps are used.
        </p>
      </section>

      <section className="card" aria-labelledby="coverage-heading">
        <h2 id="coverage-heading">Domain coverage</h2>
        <p>
          Aligned to the{' '}
          <a href={STUDY_GUIDE_URL} target="_blank" rel="noopener noreferrer">
            {OUTLINE_VERSION}
          </a>
          . Question counts approximate the official weight ranges; the official exam's exact distribution is not
          published.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Domain</th>
                <th scope="col">Official weight</th>
                <th scope="col">Questions</th>
                <th scope="col">Share of bank</th>
              </tr>
            </thead>
            <tbody>
              {DOMAINS.map((d) => {
                const n = QUESTIONS.filter((q) => q.domain === d.id).length;
                return (
                  <tr key={d.id}>
                    <th scope="row">{d.name}</th>
                    <td>{d.officialWeight}</td>
                    <td>{n}</td>
                    <td>{((n / total) * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="research-heading">
        <h2 id="research-heading">Researched sources</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Accessed</th>
                <th scope="col">Availability</th>
                <th scope="col">License / reuse</th>
                <th scope="col">How it is used</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((s) => (
                <tr key={s.url}>
                  <th scope="row">
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.name}
                    </a>
                  </th>
                  <td>{s.accessed}</td>
                  <td>{s.availability}</td>
                  <td>{s.license}</td>
                  <td>{s.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          GitHub documentation is © GitHub, Inc. and licensed under CC BY 4.0. Microsoft, GitHub, and GitHub Copilot
          are trademarks of their respective owners. This project is independent and unofficial.
        </p>
      </section>
    </>
  );
}
