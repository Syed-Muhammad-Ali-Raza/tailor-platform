import { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export function globalRateLimit(): RequestHandler | undefined {
  if (env.NODE_ENV === 'test') return undefined;
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export function authRateLimit(): RequestHandler | undefined {
  if (env.NODE_ENV === 'test') return undefined;
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  });
}
