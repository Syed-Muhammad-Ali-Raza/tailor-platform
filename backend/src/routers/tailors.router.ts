import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validate.middleware';
import * as tailorsController from '../controllers/tailors.controller';

const listQuery = z.object({
  city: z.string().max(80).optional(),
  q: z.string().max(120).optional(),
});

export function createTailorsRouter(): Router {
  const router = Router();
  router.get('/', validateQuery(listQuery), tailorsController.list);
  router.get('/:id', tailorsController.detail);
  return router;
}
