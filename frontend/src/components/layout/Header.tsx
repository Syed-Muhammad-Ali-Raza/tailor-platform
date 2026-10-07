'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { useAuth } from '@/hooks/useAuth';
import { Container } from './Container';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useI18n();
  const { isAuthenticated, isTailor, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/designs', label: t('nav_designs') },
    { href: '/measurements', label: t('nav_measurements') },
    { href: '/orders', label: t('nav_orders') },
  ];

  const secondaryLinks = isTailor
    ? [{ href: '/dashboard', label: t('nav_dashboard') }]
    : [];

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-20">
      <div
        className="h-1 bg-gradient-to-r from-forest-800 via-gold-500 to-forest-800"
        aria-hidden="true"
      />
      <div className="border-b border-stone-200/80 bg-canvas/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-gold-300 ring-1 ring-gold-500/40 transition group-hover:bg-forest-900">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"
                />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold tracking-tight text-ink">
                {t('brand_name')}
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-gold-700">
                {t('brand_tagline')}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-forest-50 hover:text-forest-800"
              >
                {link.label}
              </Link>
            ))}
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-forest-50 hover:text-forest-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-forest-50 hover:text-forest-800"
              >
                {t('nav_logout')} {user ? `(${user.name.split(' ')[0]})` : ''}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-forest-50 hover:text-forest-800"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex min-h-10 items-center rounded-full bg-forest-800 px-5 py-2 text-sm font-medium text-white shadow-card transition hover:bg-forest-900"
                >
                  {t('nav_register')}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink"
              aria-expanded={open}
              aria-label={open ? t('nav_close') : t('nav_menu')}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </Container>

        {open ? (
          <nav
            className="border-t border-stone-200 bg-canvas px-4 py-3 md:hidden"
            aria-label="Mobile"
          >
            <ul className="space-y-1">
              {[...links, ...secondaryLinks].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-full px-4 py-2 text-sm font-medium text-ink hover:bg-forest-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-full px-4 py-2 text-start text-sm font-medium text-ink hover:bg-forest-50"
                  >
                    {t('nav_logout')}
                  </button>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-full border border-stone-300 px-3 py-2 text-center text-sm font-medium text-ink"
                    >
                      {t('nav_login')}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-full bg-forest-800 px-3 py-2 text-center text-sm font-medium text-white"
                    >
                      {t('nav_register')}
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}