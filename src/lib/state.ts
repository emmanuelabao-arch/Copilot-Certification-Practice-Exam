import { submitAttempt } from './attempt';
import type { Attempt, Domain, PersistedState, SubmitReason } from './types';

export class ActiveAttemptExistsError extends Error {}

export function startNew(state: PersistedState, attempt: Attempt): PersistedState {
  if (state.activeAttempt) {
    throw new ActiveAttemptExistsError('Finish or discard the current attempt before starting a new one.');
  }
  return { ...state, activeAttempt: attempt };
}

export function discardActive(state: PersistedState): PersistedState {
  return state.activeAttempt ? { ...state, activeAttempt: null } : state;
}

export function updateActive(state: PersistedState, fn: (a: Attempt) => Attempt): PersistedState {
  const active = state.activeAttempt;
  if (!active || active.status !== 'in-progress') return state;
  const next = fn(active);
  return next === active ? state : { ...state, activeAttempt: next };
}

/**
 * Submits the active attempt and moves it into history. Calling it again (or from a
 * timer that fires late) is a no-op because there is no longer an active attempt.
 */
export function finalizeActive(
  state: PersistedState,
  reason: SubmitReason,
  now: number,
  domains: readonly Domain[],
): { state: PersistedState; submitted: Attempt | null } {
  const active = state.activeAttempt;
  if (!active || active.status !== 'in-progress') return { state, submitted: null };
  const submitted = submitAttempt(active, reason, now, domains);
  return {
    state: { ...state, activeAttempt: null, history: [submitted, ...state.history] },
    submitted,
  };
}

export function clearHistory(state: PersistedState): PersistedState {
  return state.history.length ? { ...state, history: [] } : state;
}
