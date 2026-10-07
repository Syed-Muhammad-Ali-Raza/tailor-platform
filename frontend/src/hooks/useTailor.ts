'use client';

import { apiGet } from '@/helpers/api';
import { useAsync } from './useAsync';
import type { Tailor } from '@/types';

export function useTailor(id: string | null | undefined) {
  return useAsync<Tailor | null>(
    async () => {
      if (!id) return null;
      const result = await apiGet<{ tailor: Tailor }>(`/tailors/${id}`);
      return result?.tailor ?? null;
    },
    [id],
  );
}