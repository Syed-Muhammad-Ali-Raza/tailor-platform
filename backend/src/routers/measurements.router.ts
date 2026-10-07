import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import * as measurementsController from '../controllers/measurements.controller';

const createSchema = z.object({
  label: z.string().min(1).max(80),
  garmentType: z.enum([
    'MEN_SHALWAR_KAMEEZ',
    'MEN_KURTA',
    'MEN_TROUSER',
    'WOMEN_KAMEEZ',
    'WOMEN_BOTTOM',
  ]),
  values: z.record(z.string(), z.number()),
});

const updateSchema = z.object({
  label: z.string().min(1).max(80).optional(),
  values: z.record(z.string(), z.number()).optional(),
});

export function createMeasurementsRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/', measurementsController.list);
  router.post('/', validateBody(createSchema), measurementsController.create);
  router.put('/:id', validateBody(updateSchema), measurementsController.update);
  router.delete('/:id', measurementsController.remove);
  return router;
}
