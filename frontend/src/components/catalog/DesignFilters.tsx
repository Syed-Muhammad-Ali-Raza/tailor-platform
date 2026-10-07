'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useI18n } from '@/i18n/I18nProvider';

export interface DesignFiltersProps {
  audience: string;
  onAudienceChange: (audience: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

const AUDIENCE_OPTIONS = ['ALL', 'MEN', 'WOMEN'] as const;

export function DesignFilters({
  audience,
  onAudienceChange,
  query,
  onQueryChange,
}: DesignFiltersProps) {
  const { t } = useI18n();
  const [input, setInput] = useState(query);
  const debounced = useDebounce(input, 300);

  useEffect(() => {
    onQueryChange(debounced);
  }, [debounced, onQueryChange]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label={t('catalog_title')}
        className="inline-flex self-start rounded-full border border-stone-200 bg-white p-1 shadow-card sm:self-auto"
      >
        {AUDIENCE_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onAudienceChange(value)}
            className={`min-h-9 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              audience === value
                ? 'bg-forest-800 text-white shadow-card'
                : 'text-ink hover:bg-forest-50'
            }`}
          >
            {value === 'ALL'
              ? t('filter_all')
              : value === 'MEN'
                ? t('filter_men')
                : t('filter_women')}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:max-w-xs">
        <svg
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft start-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
          />
        </svg>
        <input
          type="search"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('catalog_search_placeholder')}
          className="min-h-11 w-full rounded-full border border-stone-200 bg-white px-3 py-2 pe-4 ps-10 text-sm text-ink placeholder:text-ink-soft/70 shadow-card focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/25"
        />
      </div>
    </div>
  );
}