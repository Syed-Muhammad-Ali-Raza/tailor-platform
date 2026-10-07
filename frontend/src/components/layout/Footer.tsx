'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { Container } from './Container';

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const explore = [
    { href: '/designs', label: t('nav_designs') },
    { href: '/measurements', label: t('nav_measurements') },
    { href: '/orders', label: t('nav_orders') },
  ];

  return (
    <footer className="border-t border-forest-950 bg-forest-950 text-forest-100">
      <div
        className="h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500"
        aria-hidden="true"
      />
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold text-white">
              {t('brand_name')}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-forest-200/80">
              {t('footer_about')}
            </p>
          </div>

          <nav aria-label={t('catalog_title')} className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
              {t('footer_explore')}
            </p>
            <ul className="mt-4 space-y-2">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-forest-100/80 transition hover:text-gold-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
              {t('footer_contact')}
            </p>
            <p className="mt-4 text-forest-100/80">
              Liberty Market, Gulberg III,
              <br />
              Lahore, Pakistan
            </p>
            <p className="mt-2 text-forest-100/80">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold-300 transition hover:text-gold-200"
              >
                +92 300 1234567
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-forest-800/70 pt-6 text-xs text-forest-200/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer_rights', { year })}</p>
          <p className="tracking-wide">{t('brand_tagline')}</p>
        </div>
      </Container>
    </footer>
  );
}