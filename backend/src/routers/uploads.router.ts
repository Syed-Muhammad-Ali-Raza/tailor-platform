import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMiddleware, upload } from '../controllers/uploads.controller';

export function createUploadsRouter(): Router {
  const router = Router();
  router.post('/', requireAuth, uploadMiddleware, upload);
  return router;
}
