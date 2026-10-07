'use client';

import { apiGet } from '@/helpers/api';
import { useAsync } from './useAsync';
import type { OrderDetail, OrderSummary } from '@/types';

export interface OrderListResponse {
  orders: OrderSummary[];
  page: number;
  limit: number;
  total: number;
}

export function useOrders(status?: string) {
  const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
  return useAsync<OrderSummary[]>(async () => {
    const result = await apiGet<OrderListResponse>(`/orders${query}`);
    return result?.orders ?? [];
  }, [query]);
}

export function useOrder(id: string | null | undefined) {
  return useAsync<OrderDetail | null>(
    async () => {
      if (!id) return null;
      const result = await apiGet<{ order: OrderDetail }>(`/orders/${id}`);
      return result?.order ?? null;
    },
    [id],
  );
}