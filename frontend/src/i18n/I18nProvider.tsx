'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { en } from './en';
import { ur } from './ur';
import type { Locale, TKey, TFunc, Vars } from './types';

const dictionaries: Record<Locale, Record<TKey, string>> = { en, ur };

export function translate(
  locale: Locale,
  key: string,
  vars?: Vars,
): string {
  const template =
    (dictionaries[locale] as Record<string, string>)[key] ??
    (en as Record<string, string>)[key] ??
    key;

  if (!vars) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    if (value === undefined || value === null) return match;
    return String(value);
  });
}

interface I18nContextValue {
  locale: Locale;
  t: TFunc;
  setLocale: (next: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key, vars) => translate(locale, key, vars),
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside an I18nProvider');
  }
  return context;
}