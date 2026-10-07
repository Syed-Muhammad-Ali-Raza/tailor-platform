'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { PriceSummary } from '@/components/customize/PriceSummary';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import type { DeliveryType, DesignDetail, PaymentMethod } from '@/types';

export interface ReviewStepProps {
  design: DesignDetail;
  fabricId: string | null;
  optionIds: string[];
  quantity: number;
  measurementId: string | null;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  offeredPrice: string;
  onDeliveryTypeChange: (value: DeliveryType) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onOfferedPriceChange: (value: string) => void;
}

export function ReviewStep({
  design,
  fabricId,
  optionIds,
  quantity,
  measurementId,
  deliveryType,
  paymentMethod,
  offeredPrice,
  onDeliveryTypeChange,
  onPaymentMethodChange,
  onOfferedPriceChange,
}: ReviewStepProps) {
  const { t } = useI18n();

  const fabric = design.fabrics.find((fabric) => fabric.id === fabricId);
  const selectedOptions = design.styleOptions.filter((option) =>
    optionIds.includes(option.id),
  );

  const measurementMissing = !measurementId;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        {measurementMissing ? (
          <Alert tone="info">{t('order_requires_measurement')}</Alert>
        ) : null}

        <Select
          label={t('review_delivery')}
          value={deliveryType}
          onChange={(event) => onDeliveryTypeChange(event.target.value as DeliveryType)}
        >
          <option value="DELIVERY">{t('delivery_delivery')}</option>
          <option value="PICKUP">{t('delivery_pickup')}</option>
        </Select>

        <Select
          label={t('review_payment')}
          value={paymentMethod}
          onChange={(event) =>
            onPaymentMethodChange(event.target.value as PaymentMethod)
          }
        >
          <option value="COD">{t('payment_cod')}</option>
          <option value="PAY_AT_PICKUP">{t('payment_pay_at_pickup')}</option>
        </Select>

        <Input
          label={t('order_offer_label')}
          type="number"
          min={1}
          max={1000000}
          step="1"
          placeholder={t('order_offer_placeholder')}
          value={offeredPrice}
          onChange={(event) => onOfferedPriceChange(event.target.value)}
          hint={t('order_offer_hint')}
        />
      </div>

      <PriceSummary
        basePrice={design.basePrice}
        fabricExtraCharge={fabric?.extraCharge}
        optionExtraPrices={selectedOptions.map((option) => option.extraPrice)}
        quantity={quantity}
      />
    </div>
  );
}