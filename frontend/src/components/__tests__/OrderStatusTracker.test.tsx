import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function renderTracker(status: Parameters<typeof OrderStatusTracker>[0]['status']) {
  return render(
    <I18nProvider locale="en">
      <OrderStatusTracker status={status} />
    </I18nProvider>,
  );
}

describe('OrderStatusTracker', () => {
  it('renders all seven status steps', () => {
    renderTracker('PLACED');
    const steps = screen.getAllByRole('listitem');

    expect(steps).toHaveLength(7);
    expect(screen.getByText('Placed')).toBeInTheDocument();
    expect(screen.getByText('Measurements confirmed')).toBeInTheDocument();
    expect(
      screen.getByText('Quality check'),
    ).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('marks the current step with aria-current="step"', () => {
    renderTracker('STITCHING');

    const currentSteps = document.querySelectorAll('[aria-current="step"]');
    expect(currentSteps).toHaveLength(1);
    expect(currentSteps[0]?.textContent).toContain('Stitching');
  });

  it('shows completed steps before the current step', () => {
    const { container } = renderTracker('QUALITY_CHECK');

    const checkIcon = container.querySelector('path[d="m5 13 4 4L19 7"]');
    expect(checkIcon).not.toBeNull();
    expect(
      container.querySelectorAll('path[d="m5 13 4 4L19 7"]').length,
    ).toBeGreaterThanOrEqual(4);
  });

  it('renders a cancellation banner instead of steps', () => {
    renderTracker('CANCELLED');

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText('This order was cancelled.')).toBeInTheDocument();
  });
});