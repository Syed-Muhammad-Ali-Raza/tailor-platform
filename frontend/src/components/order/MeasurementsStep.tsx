'use client';

import { useState } from 'react';
import { apiDelete } from '@/helpers/api';
import { useMeasurements } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Button } from '@/components/ui/Button';
import { MeasurementForm } from '@/components/measurements/MeasurementForm';
import { SavedMeasurementPicker } from '@/components/measurements/SavedMeasurementPicker';
import type { Measurement } from '@/types';

export interface MeasurementsStepProps {
  measurementId: string | null;
  onSelect: (id: string | null) => void;
}

export function MeasurementsStep({
  measurementId,
  onSelect,
}: MeasurementsStepProps) {
  const { t } = useI18n();
  const { data, loading, run } = useMeasurements();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaved = (measurement: Measurement) => {
    setShowForm(false);
    onSelect(measurement.id);
    void run();
  };

  const handleDelete = async (id: string) => {
    await apiDelete(`/measurements/${id}`);
    setDeletingId(null);
    if (measurementId === id) onSelect(null);
    void run();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
          {t('meas_existing')}
        </h2>
        <Button variant="secondary" size="sm" onClick={() => setShowForm((value) => !value)}>
          {showForm ? t('common_cancel') : t('meas_new')}
        </Button>
      </div>

      {showForm ? (
        <MeasurementForm onSaved={handleSaved} />
      ) : (
        <SavedMeasurementPicker
          measurements={data}
          loading={loading}
          selectedId={measurementId}
          onSelect={onSelect}
          onDelete={(id) => void handleDelete(id)}
          deletingId={deletingId}
          setDeletingId={setDeletingId}
        />
      )}
    </div>
  );
}