import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ExamView } from './components/ExamView';
import { Home } from './components/Home';
import { RecoveryScreen } from './components/RecoveryScreen';
import { Results } from './components/Results';
import { Review } from './components/Review';
import { Sources } from './components/Sources';
import { DOMAINS } from './data/domains';
import { QUESTIONS } from './data/questions';
import { QUESTIONS_PER_EXAM } from './lib/config';
import { validateQuestionBank } from './lib/validate';
import { hrefFor, navigate, useRoute, type Route } from './state/router';
import { useExamStore } from './state/useExamStore';

function routeKey(r: Route): string {
  return 'id' in r ? `${r.name}:${r.id}` : r.name;
}

export default function App() {
  const store = useExamStore();
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);
  const bankErrors = useMemo(() => validateQuestionBank(QUESTIONS, DOMAINS, QUESTIONS_PER_EXAM), []);

  // Timed attempts can auto-submit from anywhere; show the result when that happens during the exam.
  const submittedId = store.lastSubmitted?.id;
  useEffect(() => {
    if (submittedId && route.name === 'exam') navigate({ name: 'results', id: submittedId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedId]);

  const key = routeKey(route);
  useEffect(() => {
    mainRef.current?.querySelector<HTMLElement>('h1')?.focus();
    window.scrollTo(0, 0);
  }, [key]);

  let content: ReactNode;
  if (store.recovery) {
    content = <RecoveryScreen recovery={store.recovery} onReset={store.resetAll} />;
  } else if (route.name === 'exam') {
    content = <ExamView store={store} />;
  } else if (route.name === 'results' || route.name === 'review') {
    const attempt = store.state?.history.find((a) => a.id === route.id);
    content = !attempt ? (
      <>
        <h1 tabIndex={-1}>Attempt not found</h1>
        <p>This attempt is not in this browser's history. It may have been cleared.</p>
        <a className="btn btn-primary" href={hrefFor({ name: 'home' })}>
          Go to start page
        </a>
      </>
    ) : route.name === 'results' ? (
      <Results attempt={attempt} />
    ) : (
      <Review attempt={attempt} />
    );
  } else if (route.name === 'sources') {
    content = <Sources />;
  } else {
    content = <Home store={store} bankErrors={bankErrors} />;
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <a className="brand" href={hrefFor({ name: 'home' })}>
          GH-300 Practice <span className="badge">Unofficial</span>
        </a>
        <nav aria-label="Site">
          <a href={hrefFor({ name: 'home' })}>Home</a>
          <a href={hrefFor({ name: 'sources' })}>Sources</a>
        </nav>
      </header>
      {(store.storageWarning || !store.isOwner) && (
        <div className="banners">
          {store.storageWarning && (
            <p className="alert alert-warn" role="alert">
              {store.storageWarning}
            </p>
          )}
          {!store.isOwner && (
            <div className="alert alert-warn" role="alert">
              <p>
                This exam is open in another tab or window. This tab is <strong>read-only</strong> to prevent
                conflicting changes.
              </p>
              <button type="button" className="btn" onClick={store.takeOver}>
                Use this tab instead
              </button>
            </div>
          )}
        </div>
      )}
      <main id="main" ref={mainRef} tabIndex={-1}>
        {content}
      </main>
      <footer className="site-footer">
        <p>
          Independent practice tool — not affiliated with GitHub or Microsoft. Data stays in your browser.{' '}
          <a href={hrefFor({ name: 'sources' })}>Sources &amp; licensing</a>
        </p>
      </footer>
    </>
  );
}
