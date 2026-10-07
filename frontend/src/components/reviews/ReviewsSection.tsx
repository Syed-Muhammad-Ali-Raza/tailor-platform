'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/helpers/api';
import { formatDate } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { RatingStars } from './ReviewForm';

interface ReviewData {
  id: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customerName?: string | null;
  designName?: string | null;
}

interface ReviewsResult {
  reviews: ReviewData[];
  averageRating: number;
  total: number;
}

export function ReviewsSection({ designId }: { designId: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<
    { kind: 'loading' } | { kind: 'error' } | { kind: 'done'; data: ReviewsResult }
  >({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ kind: 'loading' });
    apiGet<ReviewsResult>(`/designs/${designId}/reviews`)
      .then((result) => {
        if (alive) {
          setState({ kind: 'done', data: result ?? { reviews: [], averageRating: 0, total: 0 } });
        }
      })
      .catch(() => {
        if (alive) setState({ kind: 'error' });
      });
    return () => {
      alive = false;
    };
  }, [designId]);

  return (
    <section className="pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
          {t('review_title')}
        </h2>
        {state.kind === 'done' && state.data.total > 0 ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-3 py-1 text-xs font-semibold text-ink">
            <RatingStars value={state.data.averageRating} className="h-3.5 w-3.5" />
            <span className="text-gold-800">
              {state.data.averageRating.toFixed(1)} · {state.data.total}
            </span>
          </div>
        ) : null}
      </div>

      {state.kind === 'loading' ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
          <Spinner size="sm" />
          <span>{t('common_loading')}</span>
        </div>
      ) : null}

      {state.kind === 'error' ? <Alert tone="error">{t('err_generic')}</Alert> : null}

      {state.kind === 'done' ? (
        state.data.total === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">{t('review_empty')}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {state.data.reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {review.customerName ?? t('review_anonymous')}
                    </span>
                    <RatingStars value={review.rating} className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs text-ink-soft/70">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{review.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  );
}