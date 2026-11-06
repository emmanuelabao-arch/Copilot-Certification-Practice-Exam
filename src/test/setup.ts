import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// jsdom does not implement scrolling.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

afterEach(() => {
  localStorage.clear();
});
