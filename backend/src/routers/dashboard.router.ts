import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validate.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import * as dashboardController from '../controllers/dashboard.controller';

const ordersQuery = z.object({
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

export function createDashboardRouter(): Router {
  const router = Router();
  router.use(requireAuth, requireRole('TAILOR'));

  router.get('/summary', dashboardController.summary);
  router.get('/orders', validateQuery(ordersQuery), dashboardController.orders);
  return router;
}
