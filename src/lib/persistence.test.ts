import { DOMAINS } from '../data/domains';
import { BANK_VERSION, QUESTIONS } from '../data/questions';
import { createAttempt, selectOption, toggleFlag } from './attempt';
import { SCHEMA_VERSION, STORAGE_KEY } from './config';
import { clearHistory, discardActive, finalizeActive, startNew, updateActive, ActiveAttemptExistsError } from './state';
import { emptyState, loadState, resetState, saveState, type StorageLike } from './storage';
import { readLease, release, tryAcquire, LEASE_TTL_MS } from './tabLock';

const attempt = (id = 'a1', now = 1000) =>
  createAttempt({ bank: QUESTIONS, bankVersion: BANK_VERSION, mode: 'timed', now, seed: 3, id });

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe('storage persistence', () => {
  it('restores answers, flags, order and position exactly', () => {
    const s = memoryStorage();
    let a = attempt();
    const q = a.questions[2]!;
    a = selectOption(a, q.id, q.options[0]!.id);
    a = toggleFlag(a, q.id);
    a = { ...a, currentIndex: 2 };
    expect(saveState(s, { ...emptyState(), activeAttempt: a })).toEqual({ ok: true });

    const loaded = loadState(s);
    expect(loaded.status).toBe('ok');
    const restored = loaded.status === 'ok' ? loaded.state.activeAttempt! : null;
    expect(restored).toEqual(a);
  });

  it('returns an empty state when nothing is saved', () => {
    expect(loadState(memoryStorage())).toEqual({ status: 'ok', state: emptyState() });
  });

  it('reports corrupt JSON without discarding the raw data', () => {
    const s = memoryStorage();
    s.setItem(STORAGE_KEY, '{not json');
    const r = loadState(s);
    expect(r.status).toBe('corrupt');
    expect(r.status !== 'ok' && r.raw).toBe('{not json');
    expect(s.data.get(STORAGE_KEY)).toBe('{not json');
  });

  it('reports damaged attempt shapes as corrupt', () => {
    const s = memoryStorage();
    s.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, activeAttempt: { id: 1 }, history: [] }));
    expect(loadState(s).status).toBe('corrupt');
  });

  it('reports a different schema version as incompatible', () => {
    const s = memoryStorage();
    s.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 999, activeAttempt: null, history: [] }));
    const r = loadState(s);
    expect(r.status).toBe('incompatible');
  });

  it('handles unavailable storage and read errors', () => {
    expect(loadState(null).status).toBe('unavailable');
    const throwing: StorageLike = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {},
      removeItem: () => {},
    };
    expect(loadState(throwing).status).toBe('unavailable');
  });

  it('reports write failures such as a full quota', () => {
    const full: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
      removeItem: () => {},
    };
    const r = saveState(full, emptyState());
    expect(r.ok).toBe(false);
    expect(!r.ok && r.message).toMatch(/full/);
    expect(saveState(null, emptyState()).ok).toBe(false);
  });

  it('resets saved data', () => {
    const s = memoryStorage();
    saveState(s, emptyState());
    expect(resetState(s)).toEqual({ ok: true });
    expect(s.data.has(STORAGE_KEY)).toBe(false);
  });
});

describe('state transitions', () => {
  it('submits exactly once even if called again (duplicate submission prevention)', () => {
    let state = startNew(emptyState(), attempt());
    const first = finalizeActive(state, 'timeout', 999_999_999, DOMAINS);
    expect(first.submitted?.result?.reason).toBe('timeout');
    state = first.state;
    const second = finalizeActive(state, 'manual', 999_999_999, DOMAINS);
    expect(second.submitted).toBeNull();
    expect(second.state).toBe(state);
    expect(state.history).toHaveLength(1);
  });

  it('retry creates a separate attempt and never overwrites history', () => {
    let state = finalizeActive(startNew(emptyState(), attempt('a1')), 'manual', 2000, DOMAINS).state;
    state = startNew(state, attempt('a2', 3000));
    state = finalizeActive(state, 'manual', 4000, DOMAINS).state;
    expect(state.history.map((a) => a.id)).toEqual(['a2', 'a1']);
  });

  it('refuses to start while an attempt is active', () => {
    const state = startNew(emptyState(), attempt());
    expect(() => startNew(state, attempt('b'))).toThrow(ActiveAttemptExistsError);
  });

  it('discards the active attempt and clears history', () => {
    let state = startNew(emptyState(), attempt());
    state = discardActive(state);
    expect(state.activeAttempt).toBeNull();
    state = finalizeActive(startNew(state, attempt('c')), 'manual', 5, DOMAINS).state;
    expect(clearHistory(state).history).toEqual([]);
  });

  it('does not update a submitted attempt', () => {
    const state = { ...emptyState(), activeAttempt: { ...attempt(), status: 'submitted' as const } };
    expect(updateActive(state, (a) => ({ ...a, currentIndex: 5 }))).toBe(state);
  });
});

describe('multi-tab lease', () => {
  it('lets only one tab write at a time', () => {
    const s = memoryStorage();
    expect(tryAcquire(s, 'tab-1', 0)).toBe(true);
    expect(tryAcquire(s, 'tab-2', 1000)).toBe(false);
    expect(tryAcquire(s, 'tab-1', 1000)).toBe(true);
  });

  it('allows another tab after the lease expires or is released', () => {
    const s = memoryStorage();
    tryAcquire(s, 'tab-1', 0);
    expect(tryAcquire(s, 'tab-2', LEASE_TTL_MS + 1)).toBe(true);
    release(s, 'tab-1');
    expect(readLease(s)?.tabId).toBe('tab-2');
    release(s, 'tab-2');
    expect(readLease(s)).toBeNull();
  });

  it('supports an explicit take-over', () => {
    const s = memoryStorage();
    tryAcquire(s, 'tab-1', 0);
    expect(tryAcquire(s, 'tab-2', 10, true)).toBe(true);
    expect(tryAcquire(s, 'tab-1', 20)).toBe(false);
  });
});
