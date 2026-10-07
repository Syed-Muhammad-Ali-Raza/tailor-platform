'use client';

import Link from 'next/link';
import { useDesign, useTailor } from '@/hooks';
import { audienceKey, categoryKey, formatPkr } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { WhatsAppButton } from '@/components/whatsapp/WhatsAppButton';
import { StylePreviewPanel } from './StylePreviewPanel';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';

const EMPTY_SHIRT = '/images/kurta.svg';

export function DesignDetailView({ id }: { id: string }) {
  const { t } = useI18n();
  const { data: design, loading, error } = useDesign(id);
  const { data: tailor } = useTailor(design?.tailorId);

  if (loading || !design) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        {loading ? <Spinner size="lg" /> : <EmptyState title={t('design_not_found')} />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert tone="error">{t('err_generic')}</Alert>
      </div>
    );
  }

  const mainImage = design.images[0] ?? EMPTY_SHIRT;

  return (
    <div className="py-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-[2.5rem] border border-dashed border-gold-300/50"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-lift">
            <div className="aspect-[3/4] overflow-hidden rounded-[1.6rem] bg-canvas">
              <img
                src={mainImage}
                alt={design.name}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="absolute top-6 start-6">
              <Badge tone="success" className="bg-canvas/90">
                {t(audienceKey(design.audience))}
              </Badge>
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
              {t(categoryKey(design.category))}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              {design.name}
            </h1>
            {tailor ? (
              <p className="mt-2 text-sm text-ink-soft">
                {t('design_tailor', { name: tailor.shopName })}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-forest-100 bg-forest-50 px-5 py-4">
            <span className="text-sm font-medium text-forest-800">
              {t('design_base_price')}
            </span>
            <span className="font-display text-2xl font-bold text-forest-800">
              {formatPkr(design.basePrice)}
            </span>
          </div>

          {design.description ? (
            <p className="text-sm leading-relaxed text-ink-soft">{design.description}</p>
          ) : null}

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              {t('design_fabrics')}
            </h2>
            {design.fabrics.length === 0 ? (
              <p className="text-sm text-ink-soft">{t('design_no_fabrics')}</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2">
                {design.fabrics.map((fabric) => (
                  <li
                    key={fabric.id}
                    className="rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 text-sm shadow-card"
                  >
                    <span className="font-medium text-ink">{fabric.name}</span>
                    <span className="block text-xs text-ink-soft">
                      {formatPkr(fabric.pricePerMeter)}/m
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              {t('design_options')}
            </h2>
            {design.styleOptions.length === 0 ? (
              <p className="text-sm text-ink-soft">{t('design_no_options')}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {design.styleOptions.map((option) => (
                  <li key={option.id}>
                    <Badge tone="neutral" className="border border-stone-200/70 py-1.5">
                      {option.name} · +{formatPkr(option.extraPrice)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link href={`/order/${design.id}`} className="flex-1">
              <Button block size="lg">
                {t('design_customize')}
              </Button>
            </Link>
            <div className="flex-1">
              <WhatsAppButton
                number={tailor?.whatsapp}
                text={`${t('wa_ask_design')}: ${design.name}`}
                label={t('wa_ask_design')}
                block
              />
            </div>
          </div>

          <StylePreviewPanel designId={design.id} designName={design.name} />
        </div>
      </div>

      <ReviewsSection designId={design.id} />
    </div>
  );
}