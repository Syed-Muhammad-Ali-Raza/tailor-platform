'use client';

import { STATUS_FLOW } from '@/helpers/constants';
import { statusKey } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Card } from '@/components/ui/Card';
import type { OrderStatus } from '@/types';

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  const { t } = useI18n();

  if (status === 'CANCELLED') {
    return (
      <Card className="border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">
          {t('order_cancelled_banner')}
        </p>
      </Card>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <Card className="p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
        {t('order_track_title')}
      </h2>
      <ol className="mt-4">
        {STATUS_FLOW.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          return (
            <li key={step} className="relative flex gap-3 pb-6">
              {index < STATUS_FLOW.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute top-5 h-full w-0.5 start-[11px] ${done ? 'bg-forest-500' : 'bg-stone-200'}`}
                />
              ) : null}
              <span
                aria-hidden="true"
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-forest-600 text-white'
                    : current
                      ? 'bg-forest-800 text-white ring-4 ring-gold-200'
                      : 'bg-stone-200 text-ink-soft'
                }`}
              >
                {done ? (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <div
                className="flex-1 ps-1 pt-0.5"
                aria-current={current ? 'step' : undefined}
              >
                <p
                  className={`text-sm ${
                    current
                      ? 'font-semibold text-ink'
                      : done
                        ? 'text-ink'
                        : 'text-ink-soft/70'
                  }`}
                >
                  {t(statusKey(step))}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}