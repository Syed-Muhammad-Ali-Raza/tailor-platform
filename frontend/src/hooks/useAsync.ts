'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  run: () => Promise<T | null>;
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
      return result;
    } catch (err) {
      setData(null);
      const normalized = err instanceof Error ? err : new Error(String(err));
      setError(normalized);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fnRef.current()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((err: unknown) => {
        if (alive) {
          setData(null);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, deps);

  return { data, loading, error, run };
}