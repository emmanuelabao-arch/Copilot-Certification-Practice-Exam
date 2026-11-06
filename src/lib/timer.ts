import { WARNING_THRESHOLDS_MIN } from './config';

/** Remaining time derived from the persisted deadline; never negative. */
export function remainingMs(deadline: number, now: number): number {
  return Math.max(0, deadline - now);
}

export function isExpired(deadline: number | null, now: number): boolean {
  return deadline !== null && now >= deadline;
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

/**
 * Returns the warning threshold (in minutes) to announce now, or null.
 * Only the most urgent threshold reached is announced, and each only once.
 */
export function nextWarning(remaining: number, lastWarning: number | null): number | null {
  if (remaining <= 0) return null;
  let reached: number | null = null;
  for (const t of WARNING_THRESHOLDS_MIN) {
    if (remaining <= t * 60_000) reached = reached === null ? t : Math.min(reached, t);
  }
  if (reached === null) return null;
  if (lastWarning !== null && lastWarning <= reached) return null;
  return reached;
}
