'use client';

import Link from 'next/link';
import { formatDate, formatPkr, formatStatus } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { OrderStatus, OrderSummary } from '@/types';

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

export function OrderCard({ order }: { order: OrderSummary }) {
  const { t } = useI18n();

  return (
    <Link
      href={`/orders/${order.id}`}
      className="group block overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <Card className="border-0 shadow-none">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="font-display font-semibold tracking-tight text-ink">
              {t('order_number', { id: order.id.slice(0, 8).toUpperCase() })}
            </p>
            <p className="mt-0.5 truncate text-xs text-ink-soft">
              {formatDate(order.createdAt)} · {order.itemCount} {t('order_items')}
            </p>
            {order.offeredPrice ? (
              <p className="mt-0.5 text-xs font-medium text-gold-700">
                {t('order_offer_inline', { price: formatPkr(order.offeredPrice) })}
              </p>
            ) : null}
          </div>
          <div className="text-end">
            <p className="text-sm font-bold text-forest-800">
              {formatPkr(order.finalPrice ?? order.totalPrice)}
            </p>
            <Badge tone={statusTone[order.status]} className="mt-1">
              {formatStatus(order.status, t)}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}