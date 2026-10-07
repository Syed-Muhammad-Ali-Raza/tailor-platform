'use client';

import type { ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nProvider';

export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="grid min-h-[calc(100vh-8rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">{children}</div>

      <div className="hidden lg:block">
        <div className="relative mx-auto max-w-md">
          <div
            className="absolute -inset-6 rounded-[3rem] border-2 border-dashed border-gold-300/50"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-lift">
            <img
              src="/images/waistcoat.svg"
              alt={t('home_audience_men_title')}
              className="w-full rounded-[1.6rem]"
            />
          </div>
          <div className="absolute -bottom-6 -end-6 rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-gold-300 shadow-glow">
            {t('home_hero_badge')}
          </div>
        </div>
      </div>
    </div>
  );
}