'use client';

import { useState } from 'react';
import { apiPatch } from '@/helpers/api';
import { STATUS_FLOW } from '@/helpers/constants';
import { statusKey } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Button } from '@/components/ui/Button';
import type { OrderDetail, OrderStatus } from '@/types';

export interface AdvanceStatusButtonProps {
  orderId: string;
  status: OrderStatus;
  onAdvanced: (order: OrderDetail) => void;
}

export function AdvanceStatusButton({
  orderId,
  status,
  onAdvanced,
}: AdvanceStatusButtonProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const index = STATUS_FLOW.indexOf(status);
  const next = index >= 0 ? STATUS_FLOW[index + 1] : undefined;

  if (!next) return null;

  const handleAdvance = async () => {
    setLoading(true);
    try {
      const result = await apiPatch<{ order: OrderDetail }>(
        `/orders/${orderId}/status`,
        { status: next, note: undefined },
      );
      if (result?.order) onAdvanced(result.order);
      else window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button loading={loading} onClick={() => void handleAdvance()}>
      {t('dash_advance', { status: t(statusKey(next)) })}
    </Button>
  );
}