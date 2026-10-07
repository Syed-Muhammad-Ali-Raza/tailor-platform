import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetchBlob } from '@/helpers/api';
import { ReferencePhoto } from '@/components/orders/ReferencePhoto';

vi.mock('@/helpers/api', () => ({
  apiFetchBlob: vi.fn(),
}));

describe('ReferencePhoto', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      ...window.URL,
      createObjectURL: vi.fn(() => 'blob:mock-photo'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders the photo once the blob is fetched', async () => {
    vi.mocked(apiFetchBlob).mockResolvedValue(new Blob(['x'], { type: 'image/png' }));

    render(<ReferencePhoto url="/uploads/a.png" alt="Reference photo" />);

    expect(await screen.findByRole('img')).toHaveAttribute('src', 'blob:mock-photo');
    expect(apiFetchBlob).toHaveBeenCalledWith('/uploads/a.png');
  });

  it('renders nothing when the photo cannot be fetched', async () => {
    vi.mocked(apiFetchBlob).mockResolvedValue(null);

    const { container } = render(<ReferencePhoto url="/uploads/missing.png" />);

    await waitFor(() => expect(apiFetchBlob).toHaveBeenCalled());
    await waitFor(() => expect(container.querySelector('img')).toBeNull());
    expect(container.querySelector('[aria-busy="true"]')).toBeNull();
  });
});