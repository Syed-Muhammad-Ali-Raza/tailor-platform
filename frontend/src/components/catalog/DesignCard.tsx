'use client';

import Link from 'next/link';
import { DEFAULT_PLACEHOLDER, FALLBACK_IMAGES } from '@/helpers/constants';
import { audienceKey, categoryKey, formatPkr } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Badge } from '@/components/ui/Badge';
import type { DesignSummary } from '@/types';

export function DesignCard({ design }: { design: DesignSummary }) {
  const { t } = useI18n();

  const image = design.images[0] ?? FALLBACK_IMAGES[design.category] ?? DEFAULT_PLACEHOLDER;

  return (
    <Link
      href={`/designs/${design.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-canvas">
        <img
          src={image}
          alt={design.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 start-3">
          <Badge tone="success" className="bg-canvas/90">
            {t(audienceKey(design.audience))}
          </Badge>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-700">
          {t(categoryKey(design.category))}
        </p>
        <h3 className="font-display text-base font-semibold tracking-tight text-ink">
          {design.name}
        </h3>
        <p className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-forest-50 px-3 py-1 text-sm font-semibold text-forest-800">
            {formatPkr(design.basePrice)}
          </span>
          <span
            className="text-sm font-semibold text-gold-700 opacity-0 transition group-hover:opacity-100"
            aria-hidden="true"
          >
            →
          </span>
        </p>
      </div>
    </Link>
  );
}