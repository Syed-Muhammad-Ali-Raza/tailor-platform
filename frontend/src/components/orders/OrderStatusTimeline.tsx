'use client';

import { formatDate, formatStatus } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import type { StatusEvent } from '@/types';

export function OrderStatusTimeline({ events }: { events: StatusEvent[] }) {
  const { t } = useI18n();
  const ordered = [...events].reverse();

  return (
    <ol className="relative space-y-5 border-s-2 border-forest-100 ps-4 ms-1.5">
      {ordered.map((event, index) => {
        const isLatest = index === 0;
        return (
          <li key={event.id} className="relative">
            <span
              className={`absolute start--6 top-1.5 h-2.5 w-2.5 rounded-full ${
                isLatest
                  ? 'bg-gold-500 ring-4 ring-gold-100'
                  : 'bg-forest-600/70'
              }`}
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-ink">
              {formatStatus(event.to, t)}
              {event.from ? (
                <span className="ms-2 text-xs font-normal text-ink-soft">
                  {t('order_history_from', { from: formatStatus(event.from, t) })}
                </span>
              ) : null}
            </p>
            <p className="text-xs text-ink-soft">{formatDate(event.createdAt)}</p>
            {event.note ? (
              <p className="mt-1 text-sm text-ink-soft/80">{event.note}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}