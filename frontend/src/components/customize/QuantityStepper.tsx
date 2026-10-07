'use client';

import { useI18n } from '@/i18n/I18nProvider';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: QuantityStepperProps) {
  const { t } = useI18n();

  const clamp = (next: number) => Math.max(min, Math.min(max, next));

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-ink">{t('qty_label')}</span>
      <div className="inline-flex items-center rounded-full border border-stone-200 bg-white shadow-card">
        <button
          type="button"
          aria-label={`${t('qty_label')} -`}
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-s-full text-lg text-ink transition hover:bg-forest-50 hover:text-forest-800 disabled:opacity-40"
        >
          −
        </button>
        <output className="min-w-10 text-center text-sm font-semibold" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          aria-label={`${t('qty_label')} +`}
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-e-full text-lg text-ink transition hover:bg-forest-50 hover:text-forest-800 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}