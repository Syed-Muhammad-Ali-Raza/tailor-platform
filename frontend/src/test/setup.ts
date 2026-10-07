import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  }

  if (!window.IntersectionObserver) {
    class IntersectionObserverStub {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds: number[] = [];
    }
    window.IntersectionObserver =
      IntersectionObserverStub as unknown as typeof IntersectionObserver;
  }

  if (!window.ResizeObserver) {
    class ResizeObserverStub {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    window.ResizeObserver =
      ResizeObserverStub as unknown as typeof ResizeObserver;
  }
}
