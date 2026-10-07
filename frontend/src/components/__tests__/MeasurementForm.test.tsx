import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { apiPost } from '@/helpers/api';
import { I18nProvider } from '@/i18n/I18nProvider';
import { MeasurementForm } from '@/components/measurements/MeasurementForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@/helpers/api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

const mockedPost = vi.mocked(apiPost);

const fieldLabels: Record<string, string> = {
  length: 'Length',
  chest: 'Chest',
  waist: 'Waist',
  shoulder: 'Shoulder',
  sleeve: 'Sleeve',
  neck: 'Neck',
  daman: 'Daman',
};

const validValues: Record<string, string> = {
  length: '40',
  chest: '36',
  waist: '30',
  shoulder: '18',
  sleeve: '24',
  neck: '15',
  daman: '44',
};

function fillAllMeasurements() {
  for (const [key, value] of Object.entries(validValues)) {
    fireEvent.change(screen.getByLabelText(fieldLabels[key]), {
      target: { value },
    });
  }
}

const createdMeasurement = {
  id: 'm1',
  label: 'My kurta',
  garmentType: 'MEN_KURTA',
  values: Object.fromEntries(
    Object.entries(validValues).map(([key, value]) => [key, Number(value)]),
  ),
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('MeasurementForm', () => {
  it('shows an inline error for out-of-range values', async () => {
    render(
      <I18nProvider locale="en">
        <MeasurementForm />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByLabelText('Length'), {
      target: { value: '200' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save measurement' }));

    expect(
      await screen.findByText('Must be between 1 and 72 inches.'),
    ).toBeInTheDocument();
  });

  it('shows a required error when the label is missing', async () => {
    render(
      <I18nProvider locale="en">
        <MeasurementForm />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save measurement' }));

    expect(await screen.findAllByText('This is required.')).not.toHaveLength(0);
  });

  it('posts a valid measurement to /measurements', async () => {
    mockedPost.mockResolvedValue({ measurement: createdMeasurement });

    render(
      <I18nProvider locale="en">
        <MeasurementForm />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByLabelText('Label'), {
      target: { value: 'My kurta' },
    });
    fillAllMeasurements();
    fireEvent.click(screen.getByRole('button', { name: 'Save measurement' }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith('/measurements', {
        label: 'My kurta',
        garmentType: 'MEN_KURTA',
        values: {
          length: 40,
          chest: 36,
          waist: 30,
          shoulder: 18,
          sleeve: 24,
          neck: 15,
          daman: 44,
        },
      });
    });
  });

  it('calls onSaved with the created measurement', async () => {
    mockedPost.mockResolvedValue({ measurement: createdMeasurement });
    const onSaved = vi.fn();

    render(
      <I18nProvider locale="en">
        <MeasurementForm onSaved={onSaved} />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByLabelText('Label'), {
      target: { value: 'My kurta' },
    });
    fillAllMeasurements();
    fireEvent.click(screen.getByRole('button', { name: 'Save measurement' }));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledWith(createdMeasurement);
    });
  });

  it('clears values when the garment type changes', async () => {
    render(
      <I18nProvider locale="en">
        <MeasurementForm />
      </I18nProvider>,
    );

    fillAllMeasurements();

    fireEvent.change(screen.getByLabelText('Garment type'), {
      target: { value: 'MEN_TROUSER' },
    });

    expect(screen.queryByLabelText('Chest')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Bottom width'),
    ).toBeInTheDocument();
  });
});