import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { BANK_VERSION, QUESTIONS } from './data/questions';
import { createAttempt, selectOption, toggleFlag } from './lib/attempt';
import { LOCK_KEY, SCHEMA_VERSION, STORAGE_KEY } from './lib/config';
import type { Attempt, PersistedState } from './lib/types';

function seed(state: Partial<PersistedState>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ schemaVersion: SCHEMA_VERSION, activeAttempt: null, history: [], ...state }),
  );
}
const saved = (): PersistedState => JSON.parse(localStorage.getItem(STORAGE_KEY)!);
const make = (startedAt: number, mode: 'timed' | 'study' = 'timed'): Attempt =>
  createAttempt({ bank: QUESTIONS, bankVersion: BANK_VERSION, mode, now: startedAt, seed: 11, id: 'seeded' });

beforeEach(() => {
  window.location.hash = '';
});

describe('App', () => {
  it('shows landing information and starts an exam without sign-in', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /practice exam/i })).toBeInTheDocument();
    expect(screen.getByText(/unofficial learning tool/i)).toBeInTheDocument();
    expect(screen.getAllByText(/48\/60/).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: /start timed exam/i }));
    expect(await screen.findByRole('heading', { name: /question 1 of 60/i })).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('100:00');
    expect(saved().activeAttempt?.questions).toHaveLength(60);
  });

  it('restores answers and flags after a reload', async () => {
    let a = make(Date.now());
    const q = a.questions[0]!;
    a = toggleFlag(selectOption(a, q.id, q.options[1]!.id), q.id);
    seed({ activeAttempt: a });
    window.location.hash = '#/exam';
    render(<App />);
    expect(await screen.findByRole('heading', { name: /question 1 of 60 \(flagged\)/i })).toBeInTheDocument();
    expect(screen.getByRole(q.type === 'single' ? 'radio' : 'checkbox', { name: q.options[1]!.text })).toBeChecked();
    expect(screen.getByText('1 answered / 59 unanswered')).toBeInTheDocument();
  });

  it('auto-submits an already-expired attempt exactly once with a timeout reason', async () => {
    seed({ activeAttempt: make(Date.now() - 2 * 60 * 60 * 1000) });
    window.location.hash = '#/exam';
    render(<App />);
    expect(await screen.findByText(/time expired\. your exam was submitted automatically/i)).toBeInTheDocument();
    const state = saved();
    expect(state.activeAttempt).toBeNull();
    expect(state.history).toHaveLength(1);
    expect(state.history[0]!.result!.reason).toBe('timeout');
    expect(state.history[0]!.result!.elapsedMs).toBe(100 * 60 * 1000);
    expect(screen.getByText('Automatically (time expired)')).toBeInTheDocument();
  });

  it('shows a recovery screen for corrupt data and does not overwrite it', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    render(<App />);
    expect(screen.getByRole('heading', { name: /couldn't load your saved progress/i })).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
  });

  it('shows an incompatible-version message', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 0, activeAttempt: null, history: [] }));
    render(<App />);
    expect(screen.getByRole('alert')).toHaveTextContent(/format v0/);
  });

  it('is read-only while another tab holds the lease, and can take over', async () => {
    seed({ activeAttempt: make(Date.now()) });
    localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId: 'other-tab', expiresAt: Date.now() + 60_000 }));
    window.location.hash = '#/exam';
    render(<App />);
    expect(await screen.findByText(/read-only/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit exam/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /use this tab instead/i }));
    expect(screen.queryByText(/read-only/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit exam/i })).toBeEnabled();
  });

  it('requires confirmation to submit and cancelling keeps answers', async () => {
    let a = make(Date.now());
    a = selectOption(a, a.questions[0]!.id, a.questions[0]!.options[0]!.id);
    seed({ activeAttempt: a });
    window.location.hash = '#/exam';
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: /submit exam/i }));
    const dialog = screen.getByRole('dialog', { name: /submit your exam/i });
    expect(dialog).toHaveTextContent(/answered 1 of 60/i);
    expect(dialog).toHaveTextContent(/59 unanswered/i);
    await userEvent.click(within(dialog).getByRole('button', { name: /return to exam/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(saved().activeAttempt?.answers[a.questions[0]!.id]).toHaveLength(1);
  });

  it('study mode reveals the explanation only after "Check answer"', async () => {
    seed({ activeAttempt: make(Date.now(), 'study') });
    window.location.hash = '#/exam';
    render(<App />);
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(screen.queryByText(/explanation:/i)).not.toBeInTheDocument();
    await screen.findByRole('heading', { name: /question 1 of 60/i });
    const firstOption = document.querySelector<HTMLInputElement>('.options input')!;
    await userEvent.click(firstOption);
    await userEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(screen.getByText(/explanation:/i)).toBeInTheDocument();
    expect(firstOption).toBeDisabled();
  });

  it('timed mode auto-submits when the countdown reaches zero', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      seed({ activeAttempt: make(Date.now() - (100 * 60 * 1000 - 2000)) });
      window.location.hash = '#/exam';
      render(<App />);
      expect(screen.getByRole('timer')).toHaveTextContent('00:02');
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });
      expect(saved().history).toHaveLength(1);
      expect(saved().history[0]!.result!.reason).toBe('timeout');
    } finally {
      vi.useRealTimers();
    }
  });
});
