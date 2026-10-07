import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .default('postgresql://tailor:tailor_dev_password@localhost:15433/tailor'),
  JWT_SECRET: z.string().default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(25),
  TRYON_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  TRYON_FREE_DAILY_LIMIT: z.coerce.number().int().nonnegative().default(5),
  TRYON_PROVIDER: z.enum(['disabled', 'mock', 'http']).default('disabled'),
  AI_API_URL: z.string().default(''),
  AI_API_KEY: z.string().default(''),
  NOTIFY_WEBHOOK_URL: z.string().default(''),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(5),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${JSON.stringify(parsed.error.issues)}`);
}

export const env = parsed.data;
export type Env = typeof env;
