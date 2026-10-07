import { PrismaLike } from '../types/deps';
import { AppError, badRequest, conflict, notFound } from '../utils/errors';
import { Pagination } from '../utils/pagination';
import * as designModel from '../models/design.model';
import * as reviewModel from '../models/review.model';

const RATING_MIN = 1;
const RATING_MAX = 5;

function assertRating(rating: unknown): void {
  if (
    !Number.isInteger(rating) ||
    Number(rating) < RATING_MIN ||
    Number(rating) > RATING_MAX
  ) {
    throw badRequest(`Rating must be an integer between ${RATING_MIN} and ${RATING_MAX}`);
  }
}

export function serializeReview(review: {
  id: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  order?: {
    customer?: { name?: string | null } | null;
    items?: { designName?: string }[];
  } | null;
}) {
  return {
    id: review.id,
    orderId: review.orderId,
    rating: review.rating,
    comment: review.comment ?? null,
    createdAt: review.createdAt,
    customerName: review.order?.customer?.name ?? null,
    designName: review.order?.items?.[0]?.designName ?? null,
  };
}

export async function createReview(
  prisma: PrismaLike,
  customerId: string,
  orderId: string,
  input: { rating: number; comment?: string },
) {
  assertRating(input.rating);

  const order = await reviewModel.findOwnedOrderForReview(prisma, orderId, customerId);
  if (!order) throw notFound('Order not found');
  if (order.status !== 'DELIVERED') {
    throw new AppError('CONFLICT', 'Orders can only be reviewed after delivery');
  }

  const existing = await reviewModel.findReviewOnOrder(prisma, orderId);
  if (existing) throw conflict('This order has already been reviewed');

  const comment = input.comment?.trim() ? input.comment.trim() : undefined;
  const review = await reviewModel.createReview(prisma, {
    orderId,
    rating: input.rating,
    comment,
  });
  return { review: serializeReview(review) };
}

export async function updateReview(
  prisma: PrismaLike,
  customerId: string,
  orderId: string,
  input: { rating?: number; comment?: string },
) {
  if (input.rating !== undefined) assertRating(input.rating);

  const data: { rating?: number; comment?: string } = {};
  if (input.rating !== undefined) data.rating = input.rating;
  if (input.comment !== undefined) {
    data.comment = input.comment.trim() ? input.comment.trim() : undefined;
  }
  if (Object.keys(data).length === 0) throw badRequest('Nothing to update');

  const review = await reviewModel.findOwnedReview(prisma, orderId, customerId);
  if (!review) throw notFound('Review not found');

  const updated = await reviewModel.updateReview(prisma, review.id, data);
  return { review: serializeReview(updated) };
}

export async function listDesignReviews(
  prisma: PrismaLike,
  designId: string,
  pagination: Pagination,
) {
  const design = await designModel.findDesignById(prisma, designId);
  if (!design) throw notFound('Design not found');

  const [reviews, stats] = await Promise.all([
    reviewModel.listReviewsByDesign(prisma, designId, pagination),
    reviewModel.aggregateReviewsByDesign(prisma, designId),
  ]);

  return {
    reviews: reviews.map(serializeReview),
    averageRating:
      stats._avg.rating === null ? 0 : Math.round(Number(stats._avg.rating) * 100) / 100,
    total: stats._count,
    page: pagination.page,
    limit: pagination.limit,
  };
}