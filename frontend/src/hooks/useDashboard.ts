'use client';

import { apiGet } from '@/helpers/api';
import { useAsync } from './useAsync';
import type { DashboardSummary, OrderSummary } from '@/types';

export interface DashboardOrdersResponse {
  orders: OrderSummary[];
  page: number;
  limit: number;
  total: number;
}

export function useDashboard(status?: string) {
  const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';

  return useAsync(
    async () => {
      const [summary, orders] = await Promise.all([
        apiGet<{ summary: DashboardSummary }>('/dashboard/summary'),
        apiGet<DashboardOrdersResponse>(`/dashboard/orders${query}`),
      ]);
      return {
        summary: summary?.summary ?? null,
        orders: orders?.orders ?? [],
      };
    },
    [query],
  );
}