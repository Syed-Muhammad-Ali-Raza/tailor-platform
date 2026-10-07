'use client';

import { useI18n } from '@/i18n/I18nProvider';
import type { ReactNode } from 'react';

export type DashboardTab = 'orders' | 'designs';

export interface DashboardTabsProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  ordersCount?: number;
}

export function DashboardTabs({ active, onChange }: DashboardTabsProps) {
  const { t } = useI18n();

  const tabs: { value: DashboardTab; label: string }[] = [
    { value: 'orders', label: t('dash_tab_orders') },
    { value: 'designs', label: t('dash_tab_designs') },
  ];

  return (
    <div
      role="tablist"
      aria-label={t('dash_title')}
      className="inline-flex self-start rounded-full border border-stone-200 bg-white p-1 shadow-card sm:self-auto"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`min-h-10 rounded-full px-5 py-2 text-sm font-medium transition ${
            active === tab.value
              ? 'bg-forest-800 text-white shadow-card'
              : 'text-ink hover:bg-forest-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardTabPanel({
  children,
}: {
  children: ReactNode;
}) {
  return <div role="tabpanel" className="mt-4">{children}</div>;
}