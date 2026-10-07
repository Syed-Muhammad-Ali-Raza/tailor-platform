import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import * as tryonController from '../controllers/tryon.controller';

const previewSchema = z.object({
  designId: z.string().min(1),
  photoBase64: z.string().max(8_000_000).optional(),
});

export function createTryOnRouter(): Router {
  const router = Router();
  router.post('/preview', requireAuth, validateBody(previewSchema), tryonController.preview);
  return router;
}
