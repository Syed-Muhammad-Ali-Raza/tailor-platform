import { RequestHandler } from 'express';
import { ZodType } from 'zod';
import { AppError } from '../utils/errors';

function toDetails(error: unknown): { path: string; message: string }[] {
  const issues = (error as { issues?: { path: PropertyKey[]; message: string }[] }).issues;
  if (!Array.isArray(issues)) return [];
  return issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message }));
}

function wrap(schema: ZodType, target: 'body' | 'query'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(target === 'body' ? req.body : req.query);
    if (!result.success) {
      next(
        new AppError('VALIDATION_ERROR', 'Request validation failed', toDetails(result.error)),
      );
      return;
    }
    if (target === 'body') req.body = result.data;
    else {
      req.validated = { ...(req.validated ?? {}), query: result.data };
    }
    next();
  };
}

export const validateBody = (schema: ZodType): RequestHandler => wrap(schema, 'body');

export const validateQuery = (schema: ZodType): RequestHandler => wrap(schema, 'query');

export function body<T>(req: { body: unknown }): T {
  return req.body as T;
}

export function query<T>(req: { validated?: { query?: unknown } }): T {
  return (req.validated?.query ?? {}) as T;
}
