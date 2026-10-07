'use client';

import { apiGet } from '@/helpers/api';
import { useAsync } from './useAsync';
import type { DesignDetail, DesignListResponse } from '@/types';

export interface DesignFilters {
  audience?: string;
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export function useDesigns(filters: DesignFilters = {}) {
  const query = new URLSearchParams();
  if (filters.audience && filters.audience !== 'ALL') query.set('audience', filters.audience);
  if (filters.category) query.set('category', filters.category);
  if (filters.q) query.set('q', filters.q);
  if (filters.page !== undefined) query.set('page', String(filters.page));
  if (filters.limit !== undefined) query.set('limit', String(filters.limit));

  const key = query.toString();

  return useAsync(
    () => apiGet<DesignListResponse>(`/designs${key ? `?${key}` : ''}`),
    [key],
  );
}

export function useDesign(id: string | null | undefined) {
  return useAsync(
    async () => {
      if (!id) return null;
      const result = await apiGet<{ design: DesignDetail }>(`/designs/${id}`);
      return result?.design ?? null;
    },
    [id],
  );
}

export function useTailorDesigns() {
  return useAsync(async () => {
    const result = await apiGet<{ designs: DesignDetail[] }>('/tailor/designs');
    return result?.designs ?? [];
  }, []);
}