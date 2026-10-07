'use client';

import Link from 'next/link';
import { useAuth, useOrder } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { CancelOrderButton } from './CancelOrderButton';
import { OrderDetail } from './OrderDetail';
import { OrderStatusTracker } from './OrderStatusTracker';

export function OrderDetailView({ id }: { id: string }) {
  const { t } = useI18n();
  const { isAuthenticated, hydrated, user } = useAuth();
  const { data: order, loading, error, run } = useOrder(id);

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

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-8">
        <Alert tone="error">{t('err_generic')}</Alert>
      </div>
    );
  }

  const canCancel =
    order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const canReview = order.status === 'DELIVERED' && user?.role === 'CUSTOMER';

  return (
    <div className="space-y-6">
      <OrderStatusTracker status={order.status} />
      <OrderDetail
        order={order}
        customerWhatsapp={user?.phone}
        canReview={canReview}
        onCancelled={() => void run()}
      />
      {canCancel ? (
        <div className="flex justify-end">
          <CancelOrderButton orderId={order.id} onCancelled={() => void run()} />
        </div>
      ) : null}
    </div>
  );
}