'use client';

import { useRef, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { apiUploadImage } from '@/helpers/api';
import { PriceSummary } from '@/components/customize/PriceSummary';
import { ReferencePhoto } from '@/components/orders/ReferencePhoto';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
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
  referencePhotoUrl: string | null;
  onDeliveryTypeChange: (value: DeliveryType) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onOfferedPriceChange: (value: string) => void;
  onReferencePhotoChange: (url: string | null) => void;
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
  referencePhotoUrl,
  onDeliveryTypeChange,
  onPaymentMethodChange,
  onOfferedPriceChange,
  onReferencePhotoChange,
}: ReviewStepProps) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fabric = design.fabrics.find((fabric) => fabric.id === fabricId);
  const selectedOptions = design.styleOptions.filter((option) =>
    optionIds.includes(option.id),
  );

  const measurementMissing = !measurementId;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(false);
    try {
      const result = await apiUploadImage(file);
      if (!result) return;
      onReferencePhotoChange(result.url);
    } catch {
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  }

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

        <div className="rounded-xl border border-stone-200/80 bg-white p-4">
          <p className="text-sm font-medium text-ink">{t('order_photo_label')}</p>
          <p className="mt-1 text-xs text-ink-soft">{t('order_photo_hint')}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
            aria-label={t('order_photo_add')}
          />
          {referencePhotoUrl ? (
            <div className="mt-3">
              <ReferencePhoto
                url={referencePhotoUrl}
                alt={t('order_reference_photo')}
                className="max-h-56 w-full rounded-lg border border-stone-200/80 object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => onReferencePhotoChange(null)}
              >
                {t('order_photo_remove')}
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? t('order_photo_uploading') : t('order_photo_add')}
            </Button>
          )}
          {uploadError ? (
            <Alert tone="info">{t('order_photo_error')}</Alert>
          ) : null}
        </div>
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