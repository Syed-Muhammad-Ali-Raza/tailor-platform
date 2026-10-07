'use client';

import Link from 'next/link';
import { useDesigns } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Container } from '@/components/layout/Container';
import { DesignGrid } from '@/components/catalog/DesignGrid';
import { Button } from '@/components/ui/Button';
import { WhatsAppButton } from '@/components/whatsapp/WhatsAppButton';

const HOW_STEPS = [
  { titleKey: 'home_step1_title', subKey: 'home_step1_sub' },
  { titleKey: 'home_step2_title', subKey: 'home_step2_sub' },
  { titleKey: 'home_step3_title', subKey: 'home_step3_sub' },
  { titleKey: 'home_step4_title', subKey: 'home_step4_sub' },
];

const CRAFT_ITEMS = [
  { titleKey: 'home_craft_item1_title', subKey: 'home_craft_item1_sub' },
  { titleKey: 'home_craft_item2_title', subKey: 'home_craft_item2_sub' },
  { titleKey: 'home_craft_item3_title', subKey: 'home_craft_item3_sub' },
];

const TRUST_ITEMS = ['home_trust_fitting', 'home_trust_delivery', 'home_trust_payment'];

const AUDIENCE_CARDS = [
  {
    audience: 'MEN',
    titleKey: 'home_audience_men_title',
    subKey: 'home_audience_men_sub',
    image: '/images/kurta.svg',
  },
  {
    audience: 'WOMEN',
    titleKey: 'home_audience_women_title',
    subKey: 'home_audience_women_sub',
    image: '/images/kameez.svg',
  },
];

export function HomeContent() {
  const { t } = useI18n();
  const { data, loading } = useDesigns({ limit: 4 });

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 -end-24 h-96 w-96 rounded-full bg-gold-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-32 -start-32 h-80 w-80 rounded-full bg-forest-200/50 blur-3xl"
          aria-hidden="true"
        />

        <Container className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-800">
              {t('home_eyebrow')}
            </p>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {t('home_hero_title')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {t('home_hero_sub')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/designs" className="inline-flex">
                <Button size="lg">{t('nav_designs')}</Button>
              </Link>
              <WhatsAppButton
                text={t('home_whatsapp_title')}
                label={t('wa_cta')}
              />
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {TRUST_ITEMS.map((key) => (
                <li key={key} className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-up lg:max-w-none">
            <div
              className="absolute -inset-8 rounded-full border-2 border-dashed border-gold-300/50"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-lift">
              <img
                src="/images/kameez.svg"
                alt={t('home_audience_men_title')}
                className="w-full rounded-[1.6rem]"
              />
            </div>
            <div className="absolute -bottom-8 -start-6 w-40 -rotate-6 overflow-hidden rounded-2xl bg-white p-2 shadow-lift sm:w-48">
              <img
                src="/images/kurta.svg"
                alt={t('home_audience_men_title')}
                className="w-full rounded-xl"
              />
            </div>
            <div className="absolute -top-6 -end-6 w-36 rotate-6 overflow-hidden rounded-2xl bg-white p-2 shadow-lift sm:w-44">
              <img
                src="/images/waistcoat.svg"
                alt={t('home_audience_men_title')}
                className="w-full rounded-xl"
              />
            </div>
            <div className="absolute bottom-0 -end-2 translate-y-1/3 rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-gold-300 shadow-glow sm:-end-4">
              {t('home_hero_badge')}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-stone-200/70 bg-white/50">
        <Container className="grid gap-4 py-10 sm:grid-cols-2">
          {AUDIENCE_CARDS.map((card) => (
            <Link
              key={card.audience}
              href={`/designs?audience=${card.audience}`}
              className="group flex items-center gap-5 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-4 shadow-card transition hover:border-forest-300 hover:shadow-lift"
            >
              <div className="w-28 shrink-0 overflow-hidden rounded-xl bg-canvas ring-1 ring-stone-200/80 sm:w-32">
                <img
                  src={card.image}
                  alt={t(card.titleKey)}
                  className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold tracking-tight text-ink">
                  {t(card.titleKey)}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{t(card.subKey)}</p>
                <p className="mt-2 text-sm font-semibold text-gold-700">
                  {t('home_audience_explore')} <span aria-hidden="true">→</span>
                </p>
              </div>
            </Link>
          ))}
        </Container>
      </section>

      <section className="bg-canvas">
        <Container className="py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {t('home_craft_title')}
            </h2>
            <p className="mt-3 text-base text-ink-soft">{t('home_craft_sub')}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {CRAFT_ITEMS.map((item, index) => (
              <div
                key={item.titleKey}
                className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-800 font-display text-lg font-semibold text-gold-300">
                  {index + 1}
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-ink">
                  {t(item.titleKey)}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {t(item.subKey)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-stone-200/70 bg-white/60">
        <Container className="py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {t('home_how_title')}
            </h2>
          </div>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((step, index) => (
              <li key={step.titleKey} className="relative">
                {index < HOW_STEPS.length - 1 ? (
                  <div
                    className="absolute top-5 hidden h-px w-full bg-gradient-to-r from-gold-300 to-forest-200 lg:block"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold-400 bg-canvas font-display text-base font-semibold text-gold-800">
                    {index + 1}
                  </span>
                  <p className="mt-4 font-semibold tracking-tight text-ink">
                    {t(step.titleKey)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {t(step.subKey)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {t('home_featured_title')}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{t('catalog_title')}</p>
          </div>
          <Link
            href="/designs"
            className="shrink-0 text-sm font-semibold text-gold-700 transition hover:text-gold-800"
          >
            {t('home_view_all')} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mt-8">
          <DesignGrid designs={data?.designs ?? null} loading={loading} error={null} />
        </div>
      </Container>

      <Container className="pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest-950 px-6 py-12 text-center sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute -top-20 start-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold-500/20 blur-3xl rtl:translate-x-1/2"
            aria-hidden="true"
          />
          <h2 className="relative font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {t('home_whatsapp_title')}
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-forest-100/80">
            {t('home_whatsapp_sub')}
          </p>
          <div className="relative mx-auto mt-6 max-w-xs">
            <WhatsAppButton text={t('home_whatsapp_title')} label={t('wa_cta')} block />
          </div>
        </div>
      </Container>
    </div>
  );
}