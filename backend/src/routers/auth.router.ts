import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';

const phoneRegex = /^(\+923|03)\d{9}$/;

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(phoneRegex, 'Invalid Pakistani phone number'),
  password: z.string().min(8).max(72),
  email: z.email('Invalid email').optional(),
  role: z.enum(['CUSTOMER', 'TAILOR']).optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(3).max(120),
  password: z.string().min(1).max(72),
});

export function createAuthRouter(): Router {
  const router = Router();
  const limiter = authRateLimit();

  if (limiter) router.use(limiter);
  router.post('/register', validateBody(registerSchema), authController.register);
  router.post('/login', validateBody(loginSchema), authController.login);
  router.get('/me', requireAuth, authController.me);
  return router;
}
