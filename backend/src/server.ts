import { env } from './config/env';
import { createPrisma } from './config/prisma';
import { createTryOnProvider } from './proxy/ai.proxy';
import { createApp } from './app';
import { logger } from './utils/logger';

const prisma = createPrisma();
const app = createApp({ prisma, tryOnProvider: createTryOnProvider() });

const server = app.listen(env.PORT, () => {
  logger.info('Server listening', { port: env.PORT, env: env.NODE_ENV });
});

function shutdown(signal: string) {
  logger.info('Shutting down', { signal });
  server.close(() => {
    prisma
      .$disconnect()
      .catch(() => undefined)
      .finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
