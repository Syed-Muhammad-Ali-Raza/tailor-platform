'use client';

import type { GarmentField } from '@/helpers/constants';
import { useI18n } from '@/i18n/I18nProvider';

export interface MeasurementFieldProps {
  field: GarmentField;
  value: string;
  error?: string;
  onChange: (key: string, value: string) => void;
}

export function MeasurementField({
  field,
  value,
  error,
  onChange,
}: MeasurementFieldProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-1">
      <label
        htmlFor={`measurement-${field.key}`}
        className="block text-sm font-medium text-ink"
      >
        {t(field.labelKey)}
      </label>
      <div className="flex items-center">
        <input
          id={`measurement-${field.key}`}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          step="0.25"
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/25 ${error ? 'border-red-400' : 'border-stone-300/90'}`}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink-soft/80">
          {field.min}–{field.max} {t('meas_inches_hint')}
        </p>
      )}
    </div>
  );
}