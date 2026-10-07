'use client';

import { useState } from 'react';
import { apiPost } from '@/helpers/api';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

export interface CancelOrderButtonProps {
  orderId: string;
  disabled?: boolean;
  onCancelled: () => void;
}

export function CancelOrderButton({
  orderId,
  disabled = false,
  onCancelled,
}: CancelOrderButtonProps) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  if (!confirming) {
    return (
      <Button variant="danger" disabled={disabled} onClick={() => setConfirming(true)}>
        {t('order_cancel')}
      </Button>
    );
  }

  const handleCancel = async () => {
    setLoading(true);
    setError(false);
    try {
      await apiPost(`/orders/${orderId}/cancel`, {});
      onCancelled();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-red-700">{t('order_cancel_confirm')}</p>
      {error ? <Alert tone="error">{t('err_generic')}</Alert> : null}
      <div className="flex gap-2">
        <Button
          variant="danger"
          loading={loading}
          onClick={() => void handleCancel()}
        >
          {t('common_confirm')}
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          {t('common_cancel')}
        </Button>
      </div>
    </div>
  );
}