import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { DesignCard } from '@/components/catalog/DesignCard';
import type { DesignSummary } from '@/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const design: DesignSummary = {
  id: 'abc',
  tailorId: 't1',
  name: 'Classic Kurta',
  audience: 'MEN',
  category: 'KURTA',
  basePrice: 2800,
  images: [],
  active: true,
};

describe('DesignCard', () => {
  it('links to the design detail page', () => {
    render(
      <I18nProvider locale="en">
        <DesignCard design={design} />
      </I18nProvider>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/designs/abc');
  });

  it('shows the design name, category and audience', () => {
    render(
      <I18nProvider locale="en">
        <DesignCard design={design} />
      </I18nProvider>,
    );

    expect(screen.getByText('Classic Kurta')).toBeInTheDocument();
    expect(screen.getByText('Kurta')).toBeInTheDocument();
    expect(screen.getByText('Men')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Rs 2,800')),
    ).toBeInTheDocument();
  });

  it('falls back to the category placeholder image', () => {
    render(
      <I18nProvider locale="en">
        <DesignCard design={design} />
      </I18nProvider>,
    );

    const image = screen.getByRole('img', { name: 'Classic Kurta' });
    expect(image).toHaveAttribute('src', '/images/kurta.svg');
  });

  it('uses the first image when present', () => {
    render(
      <I18nProvider locale="en">
        <DesignCard design={{ ...design, images: ['/uploads/a.jpg'] }} />
      </I18nProvider>,
    );

    const image = screen.getByRole('img', { name: 'Classic Kurta' });
    expect(image).toHaveAttribute('src', '/uploads/a.jpg');
  });
});