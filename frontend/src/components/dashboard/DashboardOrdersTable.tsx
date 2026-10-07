'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { formatPkr, formatStatus } from '@/helpers/format';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { AdvanceStatusButton } from './AdvanceStatusButton';
import type { OrderDetail, OrderStatus, OrderSummary } from '@/types';

const statusTone: Record<OrderStatus, BadgeTone> = {
  PLACED: 'info',
  ACCEPTED: 'info',
  MEASUREMENTS_CONFIRMED: 'neutral',
  STITCHING: 'warning',
  QUALITY_CHECK: 'warning',
  READY: 'success',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export interface DashboardOrdersTableProps {
  orders: OrderSummary[] | null;
  loading: boolean;
  onAdvance: (order: OrderDetail) => void;
  onReject: (orderId: string) => void;
}

export function DashboardOrdersTable({
  orders,
  loading,
  onAdvance,
  onReject,
}: DashboardOrdersTableProps) {
  const { t } = useI18n();

  if (loading && !orders) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-ink-soft">{t('common_loading')}</span>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return <EmptyState title={t('dash_orders_empty')} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200/80 bg-white font-sans shadow-card">
      <table className="w-full min-w-[640px] text-start text-sm">
        <thead>
          <tr className="border-b border-stone-200/80 text-xs uppercase tracking-[0.14em] text-gold-700">
            <th className="px-4 py-3 text-start font-semibold">{t('order_number')}</th>
            <th className="px-4 py-3 text-start font-semibold">{t('order_date')}</th>
            <th className="px-4 py-3 text-start font-semibold">{t('order_total')}</th>
            <th className="px-4 py-3 text-start font-semibold">{t('order_status')}</th>
            <th className="px-4 py-3 text-end font-semibold">{t('dash_advance_short')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order) => (
            <tr key={order.id} className="transition hover:bg-forest-50/60">
              <td className="px-4 py-3 font-medium text-ink">
                #{order.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {order.customerName ?? '—'}
              </td>
              <td className="px-4 py-3 font-semibold text-forest-800">
                {formatPkr(order.finalPrice ?? order.totalPrice)}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone[order.status]}>
                  {formatStatus(order.status, t)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <AdvanceStatusButton
                    orderId={order.id}
                    status={order.status}
                    onAdvanced={onAdvance}
                  />
                  {order.status === 'PLACED' ? (
                    <Button variant="danger" onClick={() => onReject(order.id)}>
                      {t('common_cancel')}
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}