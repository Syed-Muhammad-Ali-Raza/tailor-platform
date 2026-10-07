import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError('NOT_FOUND', `Route not found: ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message })),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
    return;
  }

  const anyErr = err as { type?: string; code?: string; status?: number; statusCode?: number };
  if (anyErr?.type === 'entity.too.large' || anyErr?.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      success: false,
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body too large' },
    });
    return;
  }

  logger.error('Unhandled error', {
    message: err instanceof Error ? err.message : String(err),
  });
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL', message: 'Internal server error' },
  });
};
