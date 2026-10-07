'use client';

import { calculateItemPrice } from '@/helpers/price';
import { formatPkr } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Card } from '@/components/ui/Card';

export interface PriceSummaryProps {
  basePrice: number;
  fabricExtraCharge?: number;
  optionExtraPrices?: number[];
  quantity?: number;
}

export function PriceSummary({
  basePrice,
  fabricExtraCharge = 0,
  optionExtraPrices = [],
  quantity = 1,
}: PriceSummaryProps) {
  const { t } = useI18n();

  const total = calculateItemPrice({
    basePrice,
    fabricExtraCharge,
    optionExtraPrices,
    quantity,
  });

  return (
    <Card className="p-5">
      <h3 className="font-display text-lg font-semibold text-ink">
        {t('price_summary_title')}
      </h3>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-soft">{t('price_base')}</dt>
          <dd className="font-medium text-ink">{formatPkr(basePrice)}</dd>
        </div>
        {fabricExtraCharge > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">{t('price_fabric')}</dt>
            <dd className="font-medium text-ink">{formatPkr(fabricExtraCharge)}</dd>
          </div>
        ) : null}
        {optionExtraPrices.length > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">{t('price_options')}</dt>
            <dd className="font-medium text-ink">
              {formatPkr(optionExtraPrices.reduce((sum, price) => sum + price, 0))}
            </dd>
          </div>
        ) : null}
        {quantity > 1 ? (
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">{t('price_quantity')}</dt>
            <dd className="font-medium text-ink">× {quantity}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t-2 border-gold-200/70 pt-3">
          <dt className="font-semibold text-ink">{t('price_total')}</dt>
          <dd className="font-display text-xl font-bold text-forest-800">
            {formatPkr(total)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-ink-soft/80">{t('price_server_note')}</p>
    </Card>
  );
}