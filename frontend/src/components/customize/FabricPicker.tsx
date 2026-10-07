'use client';

import { formatPkr } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import type { Fabric } from '@/types';

export interface FabricPickerProps {
  fabrics: Fabric[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function FabricPicker({ fabrics, selectedId, onSelect }: FabricPickerProps) {
  const { t } = useI18n();

  if (fabrics.length === 0) {
    return <p className="text-sm text-ink-soft">{t('fabric_none')}</p>;
  }

  return (
    <div className="space-y-2">
      {fabrics.map((fabric) => {
        const selected = fabric.id === selectedId;
        return (
          <label
            key={fabric.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
              selected
                ? 'border-forest-500 bg-forest-50 shadow-card'
                : 'border-stone-200/80 bg-white hover:border-forest-300'
            }`}
          >
            <input
              type="radio"
              name="fabric"
              checked={selected}
              onChange={() => onSelect(fabric.id)}
              className="h-4 w-4 accent-forest-700"
            />
            <span className="flex-1 text-sm font-medium text-ink">{fabric.name}</span>
            <span className="text-xs text-ink-soft">
              {t('fabric_per_meter', { price: formatPkr(fabric.pricePerMeter) })}
            </span>
            {fabric.extraCharge > 0 ? (
              <span className="inline-flex items-center rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-700 ring-1 ring-gold-200">
                +{formatPkr(fabric.extraCharge)}
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}