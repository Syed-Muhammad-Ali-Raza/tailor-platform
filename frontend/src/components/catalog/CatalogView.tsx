'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useDesigns } from '@/hooks/useDesigns';
import { useI18n } from '@/i18n/I18nProvider';
import { Container } from '@/components/layout/Container';
import { DesignFilters } from './DesignFilters';
import { DesignGrid } from './DesignGrid';

export function CatalogView() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const initialAudience = searchParams.get('audience') ?? 'ALL';

  const [audience, setAudience] = useState<string>(initialAudience);
  const [query, setQuery] = useState('');

  const { data, loading, error, run } = useDesigns({
    audience,
    q: query || undefined,
    limit: 20,
  });

  return (
    <Container className="py-10 lg:py-14">
      <div aria-label={t('catalog_title')}>
        <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-800">
          {t('home_eyebrow')}
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t('catalog_title')}
        </h1>
      </div>
      <div className="mt-6">
        <DesignFilters
          audience={audience}
          onAudienceChange={setAudience}
          query={query}
          onQueryChange={setQuery}
        />
      </div>
      <div className="mt-8">
        <DesignGrid
          designs={data?.designs ?? null}
          loading={loading}
          error={error}
          onRetry={() => void run()}
        />
      </div>
    </Container>
  );
}