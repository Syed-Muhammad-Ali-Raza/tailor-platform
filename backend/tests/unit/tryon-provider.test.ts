import { env } from '../../src/config/env';
import {
  createTryOnProvider,
  disabledProvider,
  httpProvider,
  mockProvider,
} from '../../src/proxy/ai.proxy';

describe('try-on providers', () => {
  afterEach(() => {
    global.fetch = undefined as unknown as typeof fetch;
  });

  it('disabled provider throws FEATURE_DISABLED', async () => {
    const provider = disabledProvider();
    await expect(provider.generatePreview({ customerId: 'u1', designId: 'd1' })).rejects.toEqual(
      expect.objectContaining({ code: 'FEATURE_DISABLED' }),
    );
  });

  it('mock provider returns the style preview asset', async () => {
    const provider = mockProvider();
    await expect(provider.generatePreview({ customerId: 'u1', designId: 'd1' })).resolves.toEqual({
      imageUrl: '/images/style-preview.svg',
    });
  });

  it('http provider posts to the AI endpoint and returns the image', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ imageUrl: '/uploads/preview.svg' }),
    }) as unknown as typeof fetch;

    const provider = httpProvider();
    const result = await provider.generatePreview({ customerId: 'u1', designId: 'd1' });
    expect(result.imageUrl).toBe('/uploads/preview.svg');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('http provider retries then surfaces INTERNAL on persistent failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('boom')) as unknown as typeof fetch;

    const provider = httpProvider();
    const attempt = provider.generatePreview({ customerId: 'u1', designId: 'd1' });
    await expect(attempt).rejects.toEqual(
      expect.objectContaining({ code: 'INTERNAL' }),
    );
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('createTryOnProvider selects the mock provider', () => {
    env.TRYON_PROVIDER = 'mock';
    expect(createTryOnProvider()).toBeDefined();
  });

  it('createTryOnProvider defaults to disabled', () => {
    env.TRYON_PROVIDER = 'disabled';
    const provider = createTryOnProvider();
    const attempt = provider.generatePreview({ customerId: 'u1', designId: 'd1' });
    expect(attempt).rejects.toMatchObject({ code: 'FEATURE_DISABLED' });
  });
});