'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiPost } from '@/helpers/api';
import { useI18n } from '@/i18n/I18nProvider';
import { useOrderDraftStore } from '@/store/orderDraftStore';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { StepIndicator, type BuilderStep } from './StepIndicator';
import { OptionsStep } from './OptionsStep';
import { MeasurementsStep } from './MeasurementsStep';
import { ReviewStep } from './ReviewStep';
import type { DesignDetail, OrderDetail } from '@/types';

const NEXT_STEP: Record<BuilderStep, BuilderStep | null> = {
  options: 'measurements',
  measurements: 'review',
  review: null,
};

const PREV_STEP: Record<BuilderStep, BuilderStep | null> = {
  options: null,
  measurements: 'options',
  review: 'measurements',
};

export function OrderBuilder({ design }: { design: DesignDetail }) {
  const { t } = useI18n();
  const router = useRouter();
  const draft = useOrderDraftStore();
  const [step, setStep] = useState<BuilderStep>('options');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const goTo = (next: BuilderStep) => {
    const order: BuilderStep[] = ['options', 'measurements', 'review'];
    if (order.indexOf(next) <= order.indexOf(step)) {
      setStep(next);
    }
  };

  const handlePlaceOrder = async () => {
    if (!draft.designId) return;
    setSubmitting(true);
    setError(false);
    try {
      const result = await apiPost<{ order: OrderDetail }>('/orders', {
        designId: draft.designId,
        fabricId: draft.fabricId ?? undefined,
        optionIds: draft.optionIds,
        measurementId: draft.measurementId ?? undefined,
        quantity: draft.quantity,
        deliveryType: draft.deliveryType,
        paymentMethod: draft.paymentMethod,
        notes: draft.notes || undefined,
        referencePhotoUrl: draft.referencePhotoUrl ?? undefined,
        offeredPrice: draft.offeredPrice ? Number(draft.offeredPrice) : undefined,
      });
      if (!result?.order) throw new Error('empty order');
      draft.reset();
      router.push(`/orders/${result.order.id}`);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepIndicator current={step} onSelect={goTo} />

      {error ? <Alert tone="error">{t('order_placed_error')}</Alert> : null}

      {step === 'options' ? (
        <OptionsStep
          design={design}
          fabricId={draft.fabricId}
          optionIds={draft.optionIds}
          quantity={draft.quantity}
          notes={draft.notes}
          onFabricSelect={(id) => draft.setField('fabricId', id)}
          onToggleOption={draft.toggleOption}
          onQuantityChange={(quantity) => draft.setField('quantity', quantity)}
          onNotesChange={(notes) => draft.setField('notes', notes)}
        />
      ) : null}

      {step === 'measurements' ? (
        <MeasurementsStep
          measurementId={draft.measurementId}
          onSelect={(id) => draft.setField('measurementId', id)}
        />
      ) : null}

      {step === 'review' ? (
        <ReviewStep
          design={design}
          fabricId={draft.fabricId}
          optionIds={draft.optionIds}
          quantity={draft.quantity}
          measurementId={draft.measurementId}
          deliveryType={draft.deliveryType}
          paymentMethod={draft.paymentMethod}
          offeredPrice={draft.offeredPrice}
          referencePhotoUrl={draft.referencePhotoUrl}
          onDeliveryTypeChange={(value) => draft.setField('deliveryType', value)}
          onPaymentMethodChange={(value) => draft.setField('paymentMethod', value)}
          onOfferedPriceChange={(value) => draft.setField('offeredPrice', value)}
          onReferencePhotoChange={(value) =>
            draft.setField('referencePhotoUrl', value)
          }
        />
      ) : null}

      <div className="flex items-center justify-between border-t border-stone-200 pt-4">
        {PREV_STEP[step] ? (
          <Button variant="ghost" onClick={() => setStep(PREV_STEP[step]!)}>
            {t('action_back')}
          </Button>
        ) : (
          <span />
        )}

        {step === 'review' ? (
          <Button
            onClick={() => void handlePlaceOrder()}
            loading={submitting}
            disabled={!draft.measurementId}
          >
            {submitting ? t('placing_order') : t('place_order')}
          </Button>
        ) : (
          NEXT_STEP[step] && (
            <Button onClick={() => setStep(NEXT_STEP[step]!)}>
              {t('action_next')}
            </Button>
          )
        )}
      </div>
    </div>
  );
}