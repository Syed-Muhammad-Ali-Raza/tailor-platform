'use client';

import { formatPkr } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import type { StyleOption } from '@/types';

export interface OptionGroupProps {
  labelKey: string;
  options: StyleOption[];
  selectedIds: string[];
  onToggle: (optionId: string) => void;
}

export function OptionGroup({
  labelKey,
  options,
  selectedIds,
  onToggle,
}: OptionGroupProps) {
  const { t } = useI18n();

  if (options.length === 0) return null;

  return (
    <fieldset className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-card">
      <legend className="px-1 font-display text-base font-semibold text-ink">
        {t(labelKey)}
      </legend>
      <div className="mt-2 space-y-2">
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                selected
                  ? 'border-forest-500 bg-forest-50'
                  : 'border-stone-200/80 hover:border-forest-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(option.id)}
                className="mt-1 h-4 w-4 accent-forest-700"
              />
              <span className="flex-1 text-sm font-medium text-ink">{option.name}</span>
              <span className="text-xs font-semibold text-gold-700">
                +{formatPkr(option.extraPrice)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}