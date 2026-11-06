import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DOMAINS } from '../data/domains';
import { LOCK_KEY, STORAGE_KEY } from '../lib/config';
import { finalizeActive } from '../lib/state';
import { emptyState, getBrowserStorage, loadState, resetState, saveState, type LoadResult } from '../lib/storage';
import { HEARTBEAT_MS, readLease, release, tryAcquire } from '../lib/tabLock';
import type { Attempt, PersistedState, SubmitReason } from '../lib/types';

export interface Recovery {
  status: 'corrupt' | 'incompatible';
  raw: string | null;
  message: string;
}

function toRecovery(result: LoadResult): Recovery | null {
  return result.status === 'corrupt' || result.status === 'incompatible'
    ? { status: result.status, raw: result.raw, message: result.message }
    : null;
}

function newTabId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useExamStore() {
  const storage = useMemo(getBrowserStorage, []);
  const tabId = useMemo(newTabId, []);
  const [initial] = useState(() => loadState(storage));

  const [state, setState] = useState<PersistedState | null>(() =>
    initial.status === 'ok' ? initial.state : initial.status === 'unavailable' ? emptyState() : null,
  );
  const [recovery, setRecovery] = useState<Recovery | null>(() => toRecovery(initial));
  const [storageWarning, setStorageWarning] = useState<string | null>(() =>
    initial.status === 'unavailable' ? initial.message : null,
  );
  const [isOwner, setIsOwner] = useState(true);
  const [lastSubmitted, setLastSubmitted] = useState<Attempt | null>(null);

  const stateRef = useRef(state);
  const ownerRef = useRef(isOwner);
  stateRef.current = state;
  ownerRef.current = isOwner;

  const reloadFromStorage = useCallback(() => {
    const result = loadState(storage);
    if (result.status === 'ok') {
      stateRef.current = result.state;
      setState(result.state);
      setRecovery(null);
    } else if (toRecovery(result)) {
      stateRef.current = null;
      setState(null);
      setRecovery(toRecovery(result));
    }
  }, [storage]);

  const commit = useCallback(
    (fn: (s: PersistedState) => PersistedState): boolean => {
      const prev = stateRef.current;
      if (!prev || !ownerRef.current) return false;
      const next = fn(prev);
      if (next === prev) return true;
      stateRef.current = next;
      setState(next);
      const res = saveState(storage, next);
      setStorageWarning(res.ok ? null : res.message);
      return true;
    },
    [storage],
  );

  const submit = useCallback(
    (reason: SubmitReason): Attempt | null => {
      let submitted: Attempt | null = null;
      commit((s) => {
        const out = finalizeActive(s, reason, Date.now(), DOMAINS);
        submitted = out.submitted;
        return out.state;
      });
      const result = submitted as Attempt | null;
      if (result) setLastSubmitted(result);
      return result;
    },
    [commit],
  );

  // Single-writer lease so two tabs cannot edit or submit the same attempt.
  useEffect(() => {
    if (!storage) return;
    const sync = () => {
      const now = Date.now();
      const lease = readLease(storage);
      const mine = !lease || lease.expiresAt <= now || lease.tabId === tabId;
      const owner = mine && tryAcquire(storage, tabId, now);
      if (owner && !ownerRef.current) reloadFromStorage();
      ownerRef.current = owner;
      setIsOwner(owner);
    };
    sync();
    const interval = window.setInterval(sync, HEARTBEAT_MS);
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCK_KEY) sync();
      if (e.key === STORAGE_KEY) reloadFromStorage();
    };
    const onHide = () => release(storage, tabId);
    window.addEventListener('storage', onStorage);
    window.addEventListener('pagehide', onHide);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pagehide', onHide);
      release(storage, tabId);
    };
  }, [storage, tabId, reloadFromStorage]);

  // Auto-submit timed attempts at the deadline, including attempts that expired while closed.
  const active = state?.activeAttempt ?? null;
  const deadline = active?.status === 'in-progress' ? active.deadline : null;
  useEffect(() => {
    if (deadline === null || !isOwner) return;
    const check = () => {
      if (Date.now() >= deadline) submit('timeout');
    };
    check();
    const timeout = window.setTimeout(check, Math.max(0, deadline - Date.now()) + 50);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('visibilitychange', check);
    };
  }, [deadline, isOwner, submit]);

  const takeOver = useCallback(() => {
    if (!storage) return;
    tryAcquire(storage, tabId, Date.now(), true);
    reloadFromStorage();
    ownerRef.current = true;
    setIsOwner(true);
  }, [storage, tabId, reloadFromStorage]);

  const resetAll = useCallback(() => {
    const res = resetState(storage);
    const fresh = emptyState();
    stateRef.current = fresh;
    setState(fresh);
    setRecovery(null);
    setStorageWarning(res.ok ? null : res.message);
  }, [storage]);

  return {
    state,
    recovery,
    storageWarning,
    isOwner,
    lastSubmitted,
    commit,
    submit,
    takeOver,
    resetAll,
  };
}

export type ExamStore = ReturnType<typeof useExamStore>;
