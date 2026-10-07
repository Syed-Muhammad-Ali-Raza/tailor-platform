'use client';

import { formatDate, formatPkr, formatStatus } from '@/helpers/format';
import { orderMessage } from '@/helpers/whatsapp';
import { useI18n } from '@/i18n/I18nProvider';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { WhatsAppButton } from '@/components/whatsapp/WhatsAppButton';
import { RatingStars, ReviewForm } from '@/components/reviews/ReviewForm';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { ReferencePhoto } from './ReferencePhoto';
import type { OrderDetail, OrderStatus } from '@/types';

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

export interface OrderDetailProps {
  order: OrderDetail;
  shopMessageText?: string;
  shopWhatsapp?: string;
  customerWhatsapp?: string;
  canReview?: boolean;
  onCancelled?: () => void;
}

export function OrderDetail({
  order,
  shopMessageText,
  shopWhatsapp,
  customerWhatsapp,
  canReview = false,
}: OrderDetailProps) {
  const { t } = useI18n();

  const shareText = orderMessage(
    {
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice,
      finalPrice: order.finalPrice,
    },
    order.tailorShopName ?? '',
    formatStatus(order.status, t),
  );

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-ink">
              {t('order_number', { id: order.id.slice(0, 8).toUpperCase() })}
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {t('order_date', { date: formatDate(order.createdAt) })} ·{' '}
              {t('order_delivery')}: {t(`delivery_${order.deliveryType.toLowerCase()}`)}
            </p>
          </div>
          <Badge tone={statusTone[order.status]}>
            {formatStatus(order.status, t)}
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/70 pt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              {t('order_total')}
            </p>
            <p className="font-display text-2xl font-bold text-forest-800">
              {formatPkr(order.finalPrice ?? order.totalPrice)}
            </p>
            {order.offeredPrice ? (
              <p className="mt-1 text-xs font-medium text-gold-700">
                {t('order_offer_inline', { price: formatPkr(order.offeredPrice) })}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {shopWhatsapp ? (
              <WhatsAppButton
                number={shopWhatsapp}
                text={shopMessageText ?? shareText}
                label={t('wa_cta')}
              />
            ) : null}
            {customerWhatsapp ? (
              <WhatsAppButton
                number={customerWhatsapp}
                text={shareText}
                label={t('order_share')}
              />
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
          {t('order_items')}
        </h2>
        <ul className="mt-3 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="rounded-xl border border-stone-200/80 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">{item.designName}</p>
                <p className="text-sm font-semibold text-ink">
                  {formatPkr(item.price)}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                {t('order_quantity')}: {item.quantity}
                {item.fabricName ? ` · ${item.fabricName}` : ''}
              </p>
              {item.selectedOptions.length > 0 ? (
                <p className="mt-1 text-xs text-ink-soft">
                  {item.selectedOptions.map((option) => option.name).join(', ')}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
            {t('order_payment')}
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t('order_payment_method')}</dt>
              <dd className="font-medium text-ink">
                {t(`payment_${order.payment.method.toLowerCase()}`)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t('order_payment_status')}</dt>
              <dd className="font-medium text-ink">{order.payment.status}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
            {t('order_history')}
          </h2>
          <div className="mt-4">
            <OrderStatusTimeline events={order.statusEvents} />
          </div>
        </Card>
      </div>

      {order.referencePhotoUrl ? (
        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
            {t('order_reference_photo')}
          </h2>
          <div className="mt-3">
            <ReferencePhoto
              url={order.referencePhotoUrl}
              alt={t('order_reference_photo')}
            />
          </div>
        </Card>
      ) : null}

      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
          {t('order_notes')}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{order.notes || t('order_no_notes')}</p>
      </Card>

      {canReview && order.status === 'DELIVERED' ? (
        <ReviewForm orderId={order.id} initial={order.review ?? null} />
      ) : null}

      {canReview && order.review ? (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <RatingStars value={order.review.rating} />
          {order.review.comment ?? ''}
        </p>
      ) : null}
    </div>
  );
}