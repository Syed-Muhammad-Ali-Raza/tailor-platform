'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiDelete } from '@/helpers/api';
import { useAuth, useMeasurements } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { MeasurementForm } from './MeasurementForm';
import { MeasurementGuide } from './MeasurementGuide';
import { SavedMeasurementPicker } from './SavedMeasurementPicker';

export function MeasurementsView() {
  const { t } = useI18n();
  const { isAuthenticated, hydrated } = useAuth();
  const { data, loading, error, run } = useMeasurements();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-8">
        <EmptyState
          title={t('auth_signin_required')}
          description={t('auth_signin_action')}
          action={
            <Link href="/login">
              <Button>{t('nav_login')}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    await apiDelete(`/measurements/${id}`);
    setDeletingId(null);
    void run();
  };

  const handleSaved = () => {
    setShowForm(false);
    void run();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-800">
            {t('meas_title')}
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t('meas_title')}
          </h1>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          {showForm ? t('common_cancel') : t('meas_new')}
        </Button>
      </div>

      <MeasurementGuide />

      {error ? <Alert tone="error">{t('err_generic')}</Alert> : null}

      {showForm ? (
        <MeasurementForm onSaved={handleSaved} />
      ) : (
        <section aria-label={t('meas_existing')}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
            {t('meas_existing')}
          </h2>
          <SavedMeasurementPicker
            measurements={data}
            loading={loading}
            selectedId={null}
            onSelect={() => undefined}
            onDelete={(id) => void handleDelete(id)}
            deletingId={deletingId}
            setDeletingId={setDeletingId}
          />
        </section>
      )}
    </div>
  );
}