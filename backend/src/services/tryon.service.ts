import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { TryOnProvider, PrismaLike } from '../types/deps';
import * as designModel from '../models/design.model';

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function preview(
  prisma: PrismaLike,
  provider: TryOnProvider | undefined,
  customerId: string,
  input: { designId: string; photoBase64?: string },
) {
  if (!env.TRYON_ENABLED || !provider) {
    throw new AppError(
      'FEATURE_DISABLED',
      'Style Preview is not enabled yet. The real fit comes from your measurements.',
    );
  }

  const design = await designModel.findDesignById(prisma, input.designId);
  if (!design || !design.active) throw new AppError('NOT_FOUND', 'Design not found');

  const usedToday = await prisma.tryOnRequest.count({
    where: { customerId, createdAt: { gte: startOfToday() } },
  });
  if (usedToday >= env.TRYON_FREE_DAILY_LIMIT) {
    throw new AppError(
      'RATE_LIMITED',
      `Daily Style Preview limit of ${env.TRYON_FREE_DAILY_LIMIT} reached. Try again tomorrow.`,
    );
  }

  const result = await provider.generatePreview({
    customerId,
    designId: input.designId,
    photoBase64: input.photoBase64,
  });

  const row = await prisma.tryOnRequest.create({
    data: {
      customerId,
      designId: input.designId,
      inputImage: input.photoBase64 ? 'stored:base64' : null,
      outputImage: result.imageUrl,
    },
  });

  return {
    preview: {
      id: row.id,
      designId: input.designId,
      imageUrl: result.imageUrl,
      createdAt: row.createdAt,
      label: 'Style Preview',
    },
  };
}
