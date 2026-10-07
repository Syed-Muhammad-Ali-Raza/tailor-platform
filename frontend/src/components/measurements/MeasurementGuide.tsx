'use client';

import { useState } from 'react';
import { GARMENT_FIELDS } from '@/helpers/constants';
import { garmentKey } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import type { GarmentType } from '@/types';

const GUIDE_FIELDS: { key: string; labelKey: string; guideKey: string }[] = [
  {
    key: 'length',
    labelKey: 'f_length',
    guideKey: 'guide_length',
  },
  { key: 'chest', labelKey: 'f_chest', guideKey: 'guide_chest' },
  { key: 'waist', labelKey: 'f_waist', guideKey: 'guide_waist' },
  { key: 'shoulder', labelKey: 'f_shoulder', guideKey: 'guide_shoulder' },
  { key: 'sleeve', labelKey: 'f_sleeve', guideKey: 'guide_sleeve' },
  { key: 'neck', labelKey: 'f_neck', guideKey: 'guide_neck' },
  { key: 'daman', labelKey: 'f_daman', guideKey: 'guide_daman' },
  {
    key: 'shalwarLength',
    labelKey: 'f_shalwar_length',
    guideKey: 'guide_shalwar_length',
  },
  {
    key: 'shalwarWaist',
    labelKey: 'f_shalwar_waist',
    guideKey: 'guide_shalwar_waist',
  },
  {
    key: 'bottomWidth',
    labelKey: 'f_bottom_width',
    guideKey: 'guide_bottom_width',
  },
  { key: 'bust', labelKey: 'f_bust', guideKey: 'guide_bust' },
  { key: 'hip', labelKey: 'f_hip', guideKey: 'guide_hip' },
  { key: 'armhole', labelKey: 'f_armhole', guideKey: 'guide_armhole' },
  {
    key: 'neckFront',
    labelKey: 'f_neck_front',
    guideKey: 'guide_neck_front',
  },
  {
    key: 'neckBack',
    labelKey: 'f_neck_back',
    guideKey: 'guide_neck_back',
  },
];

const guideKeyByField = Object.fromEntries(
  GUIDE_FIELDS.map((entry) => [entry.key, entry.guideKey]),
);

function fieldGuideKey(fieldKey: string): string {
  return guideKeyByField[fieldKey] ?? 'guide_intro';
}

export function MeasurementGuide() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [garment, setGarment] = useState<GarmentType>('MEN_KURTA');

  const garmentFields = GARMENT_FIELDS[garment] ?? [];

  return (
    <details
      className={`overflow-hidden rounded-2xl border shadow-card transition ${
        open ? 'border-forest-200 bg-forest-50/50' : 'border-stone-200/80 bg-white'
      }`}
    >
      <summary
        className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-ink"
        onClick={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
      >
        <span className="inline-flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-100 text-gold-800">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </span>
          {t('meas_guide_toggle')}
        </span>
        <svg
          className={`h-4 w-4 text-ink-soft transition ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      {open ? (
        <div className="space-y-4 border-t border-forest-200/70 p-4">
          <p className="text-sm text-ink-soft">{t('guide_intro')}</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(GARMENT_FIELDS).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setGarment(type as GarmentType)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  garment === type
                    ? 'bg-forest-800 text-white shadow-card'
                    : 'bg-white text-ink ring-1 ring-stone-300 hover:bg-forest-50'
                }`}
              >
                {t(garmentKey(type as GarmentType))}
              </button>
            ))}
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {garmentFields.map((field, index) => (
              <li key={field.key} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-100 text-xs font-bold text-forest-800">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{t(field.labelKey)}</p>
                  <p className="text-sm text-ink-soft">{t(fieldGuideKey(field.key))}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </details>
  );
}