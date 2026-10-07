'use client';

import { formatDate, garmentKey } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import type { Measurement } from '@/types';

export interface SavedMeasurementPickerProps {
  measurements: Measurement[] | null;
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
}

export function SavedMeasurementPicker({
  measurements,
  loading,
  selectedId,
  onSelect,
  onDelete,
  deletingId,
  setDeletingId,
}: SavedMeasurementPickerProps) {
  const { t } = useI18n();

  if (loading || !measurements) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-ink-soft">{t('common_loading')}</span>
      </div>
    );
  }

  if (measurements.length === 0) {
    return <EmptyState title={t('meas_empty')} />;
  }

  return (
    <ul className="space-y-2">
      {measurements.map((measurement) => {
        const selected = measurement.id === selectedId;
        const deleting = deletingId === measurement.id;
        return (
          <li
            key={measurement.id}
            className={`rounded-xl border p-3 transition ${
              selected
                ? 'border-forest-500 bg-forest-50 shadow-card'
                : 'border-stone-200/80 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="saved-measurement"
                checked={selected}
                onChange={() => onSelect(measurement.id)}
                className="h-4 w-4 accent-forest-700"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{measurement.label}</p>
                <p className="text-xs text-ink-soft">
                  {t(garmentKey(measurement.garmentType))} ·{' '}
                  {formatDate(measurement.createdAt)}
                </p>
              </div>
              {deleting ? (
                <div className="flex gap-1.5">
                  <Button
                    variant="danger"
                    className="min-h-9 px-2 text-xs"
                    onClick={() => onDelete(measurement.id)}
                  >
                    {t('common_confirm')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-9 px-2 text-xs"
                    onClick={() => setDeletingId(null)}
                  >
                    {t('common_cancel')}
                  </Button>
                </div>
              ) : (
                <>
                  <Badge tone={selected ? 'success' : 'neutral'}>{t('meas_select')}</Badge>
                  <Button
                    variant="ghost"
                    className="min-h-9 px-2 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => setDeletingId(measurement.id)}
                  >
                    {t('common_delete')}
                  </Button>
                </>
              )}
            </div>
            {deleting ? (
              <p className="mt-2 text-xs text-red-600">{t('meas_delete_confirm')}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}