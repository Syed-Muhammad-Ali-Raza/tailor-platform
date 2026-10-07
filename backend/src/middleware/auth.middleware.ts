import { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError, forbidden, unauthorized } from '../utils/errors';

export interface AuthUser {
  sub: string;
  role: string;
  name: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.sub, role: user.role, name: user.name }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload === 'string' || !payload.sub || !payload.role) {
    throw unauthorized('Invalid token');
  }
  return { sub: String(payload.sub), role: String(payload.role), name: String(payload.name ?? '') };
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const token = extractBearer(req);
    if (!token) throw unauthorized();
    req.user = verifyToken(token);
    next();
  } catch (err) {
    if (err instanceof AppError) next(err);
    else next(unauthorized('Invalid or expired token'));
  }
};

export const requireRole =
  (role: string): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role !== role && req.user.role !== 'ADMIN') return next(forbidden());
    next();
  };

export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthorized();
  return req.user;
}
