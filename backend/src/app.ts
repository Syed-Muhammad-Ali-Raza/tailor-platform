import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env';
import { AppDeps } from './types/deps';
import { createApiRouter } from './routers';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { globalRateLimit } from './middleware/rateLimit.middleware';

export function createApp(deps: AppDeps) {
  const app = express();
  app.set('prisma', deps.prisma);
  app.set('tryOnProvider', deps.tryOnProvider);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  const limiter = globalRateLimit();
  if (limiter) app.use('/api/', limiter);

  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      maxAge: '7d',
      index: false,
    }),
  );

  app.use('/api/v1', createApiRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
