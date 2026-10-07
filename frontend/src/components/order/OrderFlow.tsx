'use client';

import { useEffect } from 'react';
import { useDesign } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { useOrderDraftStore } from '@/store/orderDraftStore';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { OrderBuilder } from './OrderBuilder';

export function OrderFlow({ designId }: { designId: string }) {
  const { t } = useI18n();
  const { data: design, loading, error } = useDesign(designId);
  const setField = useOrderDraftStore((s) => s.setField);
  const reset = useOrderDraftStore((s) => s.reset);

  useEffect(() => {
    reset();
    setField('designId', designId);
  }, [designId, reset, setField]);

  if (loading || !design) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        {loading ? <Spinner size="lg" /> : <EmptyState title={t('design_not_found')} />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert tone="error">{t('err_generic')}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-800">
          {t('design_customize')}
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {design.name}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {t('step_of', { current: '1', total: '3' })}
        </p>
      </div>
      <OrderBuilder design={design} />
    </div>
  );
}