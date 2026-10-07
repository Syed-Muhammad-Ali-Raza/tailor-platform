'use client';

import { useI18n } from '@/i18n/I18nProvider';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const next = locale === 'en' ? 'ur' : 'en';
  const label = next === 'ur' ? t('lang_switch_ur') : t('lang_switch_en');

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className="min-h-9 rounded-full border border-forest-200 bg-white px-3 py-1 text-xs font-semibold text-forest-800 transition hover:border-forest-400 hover:bg-forest-50"
      aria-label={label}
    >
      {label}
    </button>
  );
}