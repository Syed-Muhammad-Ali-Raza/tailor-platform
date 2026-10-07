'use client';

import { apiGet } from '@/helpers/api';
import { useAsync } from './useAsync';
import type { Measurement } from '@/types';

export function useMeasurements() {
  return useAsync<Measurement[]>(async () => {
    const result = await apiGet<{ measurements: Measurement[] }>(
      '/measurements',
    );
    return result?.measurements ?? [];
  }, []);
}