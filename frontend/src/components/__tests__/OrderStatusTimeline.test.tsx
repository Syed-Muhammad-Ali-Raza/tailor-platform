import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import type { StatusEvent } from '@/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const PLACED_TIME = '2026-10-01T10:00:00.000Z';
const ADVANCE_TIME = '2026-10-02T12:00:00.000Z';

function renderTimeline(events: StatusEvent[]) {
  return render(
    <I18nProvider locale="en">
      <OrderStatusTimeline events={events} />
    </I18nProvider>,
  );
}

describe('OrderStatusTimeline', () => {
  it('renders events newest first with status labels', () => {
    renderTimeline([
      { id: 'ev1', from: null, to: 'PLACED', createdAt: PLACED_TIME },
      { id: 'ev2', from: 'PLACED', to: 'ACCEPTED', createdAt: ADVANCE_TIME },
    ]);

    const labels = screen.getAllByRole('listitem');
    expect(labels).toHaveLength(2);
    const first = screen.getAllByRole('listitem')[0];
    expect(first.textContent).toContain('Accepted');
    expect(within(first).queryByText('from Placed')).not.toBeNull();
  });

  it('shows notes when an event includes one', () => {
    renderTimeline([
      { id: 'ev1', from: 'QUALITY_CHECK', to: 'READY', note: 'Rush order', createdAt: ADVANCE_TIME },
    ]);

    expect(screen.getByText('Rush order')).toBeInTheDocument();
  });

  it('renders a lone placement event without a "from" note', () => {
    renderTimeline([{ id: 'ev1', from: null, to: 'PLACED', createdAt: PLACED_TIME }]);

    expect(screen.getByText('Placed')).toBeInTheDocument();
    expect(screen.queryByText(/from/)).not.toBeInTheDocument();
  });
});