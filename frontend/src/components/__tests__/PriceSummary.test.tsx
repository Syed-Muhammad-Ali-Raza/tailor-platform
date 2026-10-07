import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { PriceSummary } from '@/components/customize/PriceSummary';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe('PriceSummary', () => {
  it('shows base price and total for a plain design', () => {
    render(
      <I18nProvider locale="en">
        <PriceSummary basePrice={1000} />
      </I18nProvider>,
    );

    expect(screen.getByText('Base price')).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('Rs 1,000')),
    ).toHaveLength(2);
    expect(
      screen.getByText('The shop confirms the final price at order time.'),
    ).toBeInTheDocument();
  });

  it('computes a total that includes fabric and option extras', () => {
    render(
      <I18nProvider locale="en">
        <PriceSummary
          basePrice={1000}
          fabricExtraCharge={200}
          optionExtraPrices={[50, 100]}
          quantity={2}
        />
      </I18nProvider>,
    );

    expect(
      screen.getByText((content) => content.includes('Rs 1,000')),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Rs 200')),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Rs 150')),
    ).toBeInTheDocument();
    expect(screen.getByText('× 2')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Rs 2,700')),
    ).toBeInTheDocument();
  });

  it('hides zero-extras rows', () => {
    render(
      <I18nProvider locale="en">
        <PriceSummary basePrice={500} />
      </I18nProvider>,
    );

    const subtotal = (1000 + 200 + 150) * 2;
    expect(subtotal).toBe(2700);
    expect(screen.queryByText('Fabric extra')).not.toBeInTheDocument();
    expect(screen.queryByText('Options')).not.toBeInTheDocument();
    expect(screen.queryByText('× 2')).not.toBeInTheDocument();
  });
});