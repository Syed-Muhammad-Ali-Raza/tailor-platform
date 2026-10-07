import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { TryOnProvider } from '../types/deps';

export function disabledProvider(): TryOnProvider {
  return {
    async generatePreview() {
      throw new AppError(
        'FEATURE_DISABLED',
        'Style Preview is not enabled yet. The real fit comes from your measurements.',
      );
    },
  };
}

export function mockProvider(): TryOnProvider {
  return {
    async generatePreview() {
      return { imageUrl: '/images/style-preview.svg' };
    },
  };
}

export function httpProvider(): TryOnProvider {
  return {
    async generatePreview(input) {
      let lastError: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(env.AI_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${env.AI_API_KEY}`,
            },
            body: JSON.stringify({
              designId: input.designId,
              customerId: input.customerId,
              image: input.photoBase64,
            }),
            signal: AbortSignal.timeout(15000),
          });
          if (!res.ok) throw new Error(`AI provider responded with ${res.status}`);
          const data = (await res.json()) as { imageUrl?: string; output?: string };
          const imageUrl = data.imageUrl ?? data.output;
          if (!imageUrl) throw new Error('AI provider returned no image');
          return { imageUrl };
        } catch (err) {
          lastError = err;
          logger.warn('AI try-on attempt failed', { attempt });
          await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        }
      }
      throw new AppError('INTERNAL', 'Style Preview generation failed', {
        reason: lastError instanceof Error ? lastError.message : 'unknown',
      });
    },
  };
}

export function createTryOnProvider(): TryOnProvider {
  if (env.TRYON_PROVIDER === 'http') return httpProvider();
  if (env.TRYON_PROVIDER === 'mock') return mockProvider();
  return disabledProvider();
}
