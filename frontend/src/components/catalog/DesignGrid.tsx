'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { DesignCard } from './DesignCard';
import type { DesignSummary } from '@/types';

const SKELETON_COUNT = 6;

export function DesignGrid({
  designs,
  loading,
  error,
  onRetry,
}: {
  designs: DesignSummary[] | null;
  loading: boolean;
  error: Error | null;
  onRetry?: () => void;
}) {
  const { t } = useI18n();

  if (loading && !designs) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card"
          >
            <div className="aspect-[3/4] bg-gradient-to-br from-canvas to-forest-100/70" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 rounded bg-forest-100" />
              <div className="h-4 w-2/3 rounded bg-stone-200/80" />
              <div className="h-5 w-1/4 rounded-full bg-forest-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert tone="error">
        <div className="flex items-center justify-between gap-3">
          <span>{t('err_generic')}</span>
          {onRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              {t('common_retry')}
            </Button>
          ) : null}
        </div>
      </Alert>
    );
  }

  if (!designs || designs.length === 0) {
    return (
      <EmptyState title={t('empty_designs')} description={t('catalog_title')} />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </div>
  );
}

export function DesignGridLoading() {
  return <Spinner />;
}