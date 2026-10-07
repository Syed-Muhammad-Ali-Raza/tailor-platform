import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  servePrivateUpload,
  upload,
  uploadMiddleware,
} from '../controllers/uploads.controller';

export function createUploadsRouter(): Router {
  const router = Router();
  router.post('/', requireAuth, uploadMiddleware, upload);
  router.get('/:name', requireAuth, servePrivateUpload);
  return router;
}