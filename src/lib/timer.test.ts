import { EXAM_DURATION_MS } from './config';
import { formatClock, formatDuration, isExpired, nextWarning, remainingMs } from './timer';

const MIN = 60_000;

describe('remainingMs', () => {
  const start = 1_000_000;
  const deadline = start + EXAM_DURATION_MS;

  it('starts at 100:00', () => {
    expect(formatClock(remainingMs(deadline, start))).toBe('100:00');
  });

  it('is derived from wall-clock time, so background tabs and reloads do not add time', () => {
    // Simulate the tab being hidden/asleep for 30 minutes: no ticks happened, but time still passed.
    expect(remainingMs(deadline, start + 30 * MIN)).toBe(70 * MIN);
    expect(formatClock(remainingMs(deadline, start + 30 * MIN + 500))).toBe('70:00');
  });

  it('never goes negative and reports 00:00 at and after zero', () => {
    expect(remainingMs(deadline, deadline)).toBe(0);
    expect(remainingMs(deadline, deadline + 5 * MIN)).toBe(0);
    expect(formatClock(-1234)).toBe('00:00');
  });

  it('detects expiry exactly at the deadline', () => {
    expect(isExpired(deadline, deadline - 1)).toBe(false);
    expect(isExpired(deadline, deadline)).toBe(true);
    expect(isExpired(null, deadline + 1)).toBe(false);
  });
});

describe('nextWarning', () => {
  it('warns once at 10 minutes and once at 1 minute', () => {
    expect(nextWarning(10 * MIN + 1, null)).toBeNull();
    expect(nextWarning(10 * MIN, null)).toBe(10);
    expect(nextWarning(9 * MIN, 10)).toBeNull();
    expect(nextWarning(1 * MIN, 10)).toBe(1);
    expect(nextWarning(30_000, 1)).toBeNull();
  });

  it('only announces the most urgent threshold after a reload', () => {
    expect(nextWarning(45_000, null)).toBe(1);
  });

  it('does not warn at zero (the exam is being submitted)', () => {
    expect(nextWarning(0, null)).toBeNull();
  });
});

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration(95_000)).toBe('1m 35s');
    expect(formatDuration(EXAM_DURATION_MS)).toBe('1h 40m 0s');
  });
});
