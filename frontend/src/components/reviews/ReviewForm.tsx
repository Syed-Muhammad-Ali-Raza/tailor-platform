'use client';

import { useState } from 'react';
import { apiPost, apiPut } from '@/helpers/api';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

export interface ReviewValue {
  id?: string;
  rating: number;
  comment?: string | null;
}

export function RatingStars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${className} ${
            star <= value ? 'fill-gold-400 text-gold-500' : 'fill-stone-200 text-stone-200'
          }`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.58 6.1 20.68l1.13-6.58-4.78-4.66 6.6-.96z" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewForm({
  orderId,
  initial,
  onSaved,
}: {
  orderId: string;
  initial?: ReviewValue | null;
  onSaved?: () => void;
}) {
  const { t } = useI18n();
  const [rating, setRating] = useState<number>(initial?.rating ?? 0);
  const [comment, setComment] = useState<string>(initial?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    if (rating < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      const path = `/orders/${orderId}/review`;
      if (initial?.id) {
        await apiPut(path, { rating, comment: comment.trim() || undefined });
      } else {
        await apiPost(path, { rating, comment: comment.trim() || undefined });
      }
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError((err as { message?: string }).message ?? t('err_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  if (saved) {
    return (
      <div className="rounded-2xl border border-forest-200 bg-forest-50 p-5">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-forest-800">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
          </svg>
          {t('review_saved_toast')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-gold-300/60 bg-gold-50 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">
          {initial?.id ? t('review_update') : t('review_write')}
        </h3>
        <div className="flex gap-1" role="radiogroup" aria-label={t('review_rating_label')}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${t('review_rating_label')} ${star}`}
              onClick={() => setRating(star)}
              className={`transition ${star <= rating ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
            >
              <RatingStars value={star} className="h-6 w-6" />
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t('review_comment_placeholder')}
        rows={3}
        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-ink focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25"
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="flex justify-end">
        <Button size="sm" loading={submitting} disabled={rating < 1} onClick={() => void submit()}>
          {t('review_submit')}
        </Button>
      </div>
    </div>
  );
}