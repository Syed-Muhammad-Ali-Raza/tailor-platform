import { Router } from 'express';
import { createAuthRouter } from './auth.router';
import { createTailorsRouter } from './tailors.router';
import { createDesignsRouter } from './designs.router';
import { createTailorRouter } from './tailor.router';
import { createMeasurementsRouter } from './measurements.router';
import { createOrdersRouter } from './orders.router';
import { createDashboardRouter } from './dashboard.router';
import { createTryOnRouter } from './tryon.router';
import { createUploadsRouter } from './uploads.router';
import { ok } from '../utils/http';

const STARTED_AT = Date.now();

export function createApiRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    ok(res, {
      status: 'ok',
      uptime: Math.round((Date.now() - STARTED_AT) / 1000),
      version: process.env.npm_package_version ?? '0.1.0',
    });
  });

  router.use('/auth', createAuthRouter());
  router.use('/tailors', createTailorsRouter());
  router.use('/designs', createDesignsRouter());
  router.use('/tailor', createTailorRouter());
  router.use('/measurements', createMeasurementsRouter());
  router.use('/orders', createOrdersRouter());
  router.use('/dashboard', createDashboardRouter());
  router.use('/tryon', createTryOnRouter());
  router.use('/uploads', createUploadsRouter());
  return router;
}
