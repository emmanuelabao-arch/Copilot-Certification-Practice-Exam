import { SCHEMA_VERSION, STORAGE_KEY } from './config';
import type { Attempt, PersistedState } from './types';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type LoadResult =
  | { status: 'ok'; state: PersistedState }
  | { status: 'corrupt' | 'incompatible' | 'unavailable'; raw: string | null; message: string };

export type SaveResult = { ok: true } | { ok: false; message: string };

export const emptyState = (): PersistedState => ({
  schemaVersion: SCHEMA_VERSION,
  activeAttempt: null,
  history: [],
});

export function getBrowserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isAttempt(value: unknown): value is Attempt {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    (a.mode === 'timed' || a.mode === 'study') &&
    typeof a.startedAt === 'number' &&
    (a.deadline === null || typeof a.deadline === 'number') &&
    Array.isArray(a.questions) &&
    a.questions.length > 0 &&
    a.questions.every(
      (q) => q && typeof q === 'object' && typeof q.id === 'string' && Array.isArray(q.options),
    ) &&
    !!a.answers &&
    typeof a.answers === 'object' &&
    Array.isArray(a.flags) &&
    Array.isArray(a.checked) &&
    typeof a.currentIndex === 'number' &&
    (a.status === 'in-progress' || a.status === 'submitted') &&
    (a.status === 'in-progress' || !!a.result)
  );
}

export function loadState(storage: StorageLike | null): LoadResult {
  if (!storage) {
    return {
      status: 'unavailable',
      raw: null,
      message: 'Browser storage is unavailable (private mode or blocked). Progress cannot be saved.',
    };
  }
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'unavailable', raw: null, message: 'Browser storage could not be read.' };
  }
  if (raw === null) return { status: 'ok', state: emptyState() };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'corrupt', raw, message: 'Saved exam data is corrupt and could not be read.' };
  }
  const obj = parsed as Partial<PersistedState> | null;
  if (!obj || typeof obj !== 'object' || typeof obj.schemaVersion !== 'number') {
    return { status: 'corrupt', raw, message: 'Saved exam data is not in a recognised format.' };
  }
  if (obj.schemaVersion !== SCHEMA_VERSION) {
    return {
      status: 'incompatible',
      raw,
      message: `Saved data uses format v${obj.schemaVersion}, but this app expects v${SCHEMA_VERSION}.`,
    };
  }
  const activeOk = obj.activeAttempt === null || isAttempt(obj.activeAttempt);
  const historyOk = Array.isArray(obj.history) && obj.history.every(isAttempt);
  if (!activeOk || !historyOk) {
    return { status: 'corrupt', raw, message: 'Saved exam data is incomplete or damaged.' };
  }
  return { status: 'ok', state: obj as PersistedState };
}

export function saveState(storage: StorageLike | null, state: PersistedState): SaveResult {
  if (!storage) return { ok: false, message: 'Browser storage is unavailable; progress is not being saved.' };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (e) {
    const quota = e instanceof DOMException && /quota/i.test(e.name);
    return {
      ok: false,
      message: quota
        ? 'Browser storage is full; your latest progress was not saved. Clear history to free space.'
        : 'Your latest progress could not be saved to browser storage.',
    };
  }
}

export function resetState(storage: StorageLike | null): SaveResult {
  if (!storage) return { ok: false, message: 'Browser storage is unavailable.' };
  try {
    storage.removeItem(STORAGE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, message: 'Browser storage could not be cleared.' };
  }
}
