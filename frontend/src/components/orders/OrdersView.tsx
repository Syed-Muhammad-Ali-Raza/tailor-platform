'use client';

import Link from 'next/link';
import { useAuth, useOrders } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { OrderCard } from './OrderCard';

export function OrdersView() {
  const { t } = useI18n();
  const { isAuthenticated, hydrated } = useAuth();
  const { data, loading, error } = useOrders();

  if (!hydrated) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-8">
        <EmptyState
          title={t('auth_signin_required')}
          description={t('auth_signin_action')}
          action={
            <Link href="/login">
              <Button>{t('nav_login')}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-800">
          {t('orders_title')}
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t('orders_title')}
        </h1>
      </div>
      {error ? <Alert tone="error">{t('err_generic')}</Alert> : null}
      {loading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-sm text-ink-soft">{t('common_loading')}</span>
        </div>
      ) : data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={t('orders_empty')}
          action={
            <Link href="/designs">
              <Button>{t('nav_designs')}</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}