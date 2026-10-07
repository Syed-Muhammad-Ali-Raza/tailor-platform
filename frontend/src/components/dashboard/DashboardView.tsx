'use client';

import { useState } from 'react';
import { apiPost } from '@/helpers/api';
import { ORDER_STATUSES } from '@/helpers/constants';
import { formatPkr, formatStatus } from '@/helpers/format';
import { useAuth, useDashboard } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { DashboardOrdersTable } from './DashboardOrdersTable';
import { DashboardTabs, DashboardTabPanel, type DashboardTab } from './DashboardTabs';
import { DesignManager } from './DesignManager';
import { StatCard } from './StatCard';

export function DashboardView() {
  const { t } = useI18n();
  const { isAuthenticated, hydrated, isTailor } = useAuth();
  const [tab, setTab] = useState<DashboardTab>('orders');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { data, error, run } = useDashboard(statusFilter);

  if (!hydrated) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !isTailor) {
    return (
      <div className="py-8">
        <EmptyState
          title={t('dash_not_authorized')}
          description={t('dash_not_authorized_sub')}
        />
      </div>
    );
  }

  const summary = data?.summary;

  const handleAdvanced = () => {
    void run();
  };

  const handleReject = async (orderId: string) => {
    try {
      await apiPost(`/orders/${orderId}/cancel`, { reason: 'rejected' });
      void run();
    } catch {
      void run();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-800">
          {t('dash_title')}
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t('dash_title')}
        </h1>
      </div>

      {summary ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label={t('dash_stat_new_today')} value={summary.newToday} />
          <StatCard label={t('dash_stat_active')} value={summary.activeOrders} />
          <StatCard label={t('dash_stat_ready')} value={summary.readyOrders} />
          <StatCard
            label={t('dash_stat_delivered')}
            value={summary.deliveredThisMonth}
          />
          <StatCard
            label={t('dash_stat_revenue')}
            value={formatPkr(summary.expectedRevenue)}
          />
        </div>
      ) : null}

      <DashboardTabs active={tab} onChange={setTab} />

      {error ? <Alert tone="error">{t('err_generic')}</Alert> : null}

      {tab === 'orders' ? (
        <DashboardTabPanel>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-forest-800 text-white shadow-card'
                  : 'bg-white text-ink ring-1 ring-stone-300 hover:bg-forest-50'
              }`}
            >
              {t('dash_filter_all')}
            </button>
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === status
                    ? 'bg-forest-800 text-white shadow-card'
                    : 'bg-white text-ink ring-1 ring-stone-300 hover:bg-forest-50'
                }`}
              >
                {formatStatus(status, t)}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <DashboardOrdersTable
              orders={data?.orders ?? null}
              loading={data === null}
              onAdvance={handleAdvanced}
              onReject={(orderId) => void handleReject(orderId)}
            />
          </div>
        </DashboardTabPanel>
      ) : (
        <DashboardTabPanel>
          <DesignManager />
        </DashboardTabPanel>
      )}
    </div>
  );
}