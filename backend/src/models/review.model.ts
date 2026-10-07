import { Db } from '../types/deps';
import { Pagination } from '../utils/pagination';

export function findOwnedOrderForReview(db: Db, orderId: string, customerId: string) {
  return db.order.findFirst({ where: { id: orderId, customerId } });
}

export function findReviewOnOrder(db: Db, orderId: string) {
  return db.review.findUnique({ where: { orderId } });
}

export function findOwnedReview(db: Db, orderId: string, customerId: string) {
  return db.review.findFirst({ where: { orderId, order: { customerId } } });
}

export function createReview(
  db: Db,
  data: { orderId: string; rating: number; comment?: string },
) {
  return db.review.create({ data });
}

export function updateReview(
  db: Db,
  id: string,
  data: { rating?: number; comment?: string },
) {
  return db.review.update({ where: { id }, data });
}

export function listReviewsByDesign(db: Db, designId: string, pagination: Pagination) {
  return db.review.findMany({
    where: { order: { items: { some: { designId } } } },
    orderBy: { createdAt: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
    include: {
      order: {
        select: {
          customer: { select: { name: true } },
          items: { where: { designId }, select: { designName: true }, take: 1 },
        },
      },
    },
  });
}

export function aggregateReviewsByDesign(db: Db, designId: string) {
  return db.review.aggregate({
    where: { order: { items: { some: { designId } } } },
    _avg: { rating: true },
    _count: true,
  });
}