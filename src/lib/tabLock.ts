import { LOCK_KEY } from './config';
import type { StorageLike } from './storage';

export const LEASE_TTL_MS = 5_000;
export const HEARTBEAT_MS = 1_500;

export interface Lease {
  tabId: string;
  expiresAt: number;
}

export function readLease(storage: StorageLike): Lease | null {
  try {
    const raw = storage.getItem(LOCK_KEY);
    if (!raw) return null;
    const lease = JSON.parse(raw) as Lease;
    return typeof lease?.tabId === 'string' && typeof lease.expiresAt === 'number' ? lease : null;
  } catch {
    return null;
  }
}

/**
 * Claims the single-writer lease for this tab. Returns true when this tab owns it.
 * `force` lets a user explicitly take over from another tab.
 */
export function tryAcquire(storage: StorageLike, tabId: string, now: number, force = false): boolean {
  const current = readLease(storage);
  const free = !current || current.expiresAt <= now || current.tabId === tabId;
  if (!free && !force) return false;
  try {
    storage.setItem(LOCK_KEY, JSON.stringify({ tabId, expiresAt: now + LEASE_TTL_MS }));
  } catch {
    // Without storage there is nothing to coordinate; treat this tab as the writer.
    return true;
  }
  return readLease(storage)?.tabId === tabId;
}

export function release(storage: StorageLike, tabId: string): void {
  try {
    if (readLease(storage)?.tabId === tabId) storage.removeItem(LOCK_KEY);
  } catch {
    // ignore
  }
}
