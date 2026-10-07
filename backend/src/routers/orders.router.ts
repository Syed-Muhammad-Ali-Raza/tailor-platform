import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import * as ordersController from '../controllers/orders.controller';
import * as reviewsController from '../controllers/reviews.controller';

const createSchema = z.object({
  designId: z.string().min(1),
  fabricId: z.string().min(1).optional(),
  optionIds: z.array(z.string().min(1)).default([]),
  measurementId: z.string().min(1).optional(),
  quantity: z.number().int().min(1).max(20),
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  paymentMethod: z.enum(['COD', 'PAY_AT_PICKUP']),
  notes: z.string().max(2000).optional(),
  referencePhotoUrl: z.string().max(500).optional(),
  offeredPrice: z.number().positive().max(1000000).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/, 'dueDate must be ISO-8601')
    .optional(),
});

const listQuery = z.object({
  status: z
    .enum([
      'PLACED',
      'ACCEPTED',
      'MEASUREMENTS_CONFIRMED',
      'STITCHING',
      'QUALITY_CHECK',
      'READY',
      'DELIVERED',
      'CANCELLED',
    ])
    .optional(),
});

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

const statusSchema = z.object({
  status: z.enum([
    'PLACED',
    'ACCEPTED',
    'MEASUREMENTS_CONFIRMED',
    'STITCHING',
    'QUALITY_CHECK',
    'READY',
    'DELIVERED',
    'CANCELLED',
  ]),
  note: z.string().max(500).optional(),
});

const quoteSchema = z.object({
  finalPrice: z.number().positive().max(1000000),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export function createOrdersRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.post('/', validateBody(createSchema), ordersController.create);
  router.get('/', validateQuery(listQuery), ordersController.list);
  router.get('/:id', ordersController.detail);
  router.post('/:id/cancel', validateBody(cancelSchema), ordersController.cancel);
  router.patch('/:id/status', requireRole('TAILOR'), validateBody(statusSchema), ordersController.status);
  router.patch('/:id/quote', requireRole('TAILOR'), validateBody(quoteSchema), ordersController.quote);
  router.post('/:id/review', validateBody(reviewSchema), reviewsController.create);
  router.put('/:id/review', validateBody(reviewUpdateSchema), reviewsController.update);
  return router;
}
