import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { I18nProvider } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/types';
import { StoreHydrator } from '@/store/StoreHydrator';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Tailor Platform';

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s — ${appName}`,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeValue = cookieStore.get('locale')?.value;
  const locale: Locale = localeValue === 'ur' ? 'ur' : 'en';

  return (
    <html lang={locale} dir={locale === 'ur' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink">
        <I18nProvider locale={locale}>
          <StoreHydrator />
          <Header />
          <main className="pb-20">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}