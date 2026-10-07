import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validate.middleware';
import * as designsController from '../controllers/designs.controller';
import * as reviewsController from '../controllers/reviews.controller';

const listQuery = z.object({
  audience: z.enum(['MEN', 'WOMEN']).optional(),
  category: z
    .enum([
      'SHALWAR_KAMEEZ',
      'KURTA',
      'WAISTCOAT',
      'KAMEEZ_SHALWAR',
      'SUIT',
      'TROUSER',
      'OTHER',
    ])
    .optional(),
  tailorId: z.string().optional(),
  q: z.string().max(120).optional(),
});

export function createDesignsRouter(): Router {
  const router = Router();
  router.get('/', validateQuery(listQuery), designsController.list);
  router.get('/:id/reviews', reviewsController.listByDesign);
  router.get('/:id', designsController.detail);
  return router;
}
