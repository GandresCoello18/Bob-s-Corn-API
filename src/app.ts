import cors from '@fastify/cors';
import Fastify, { FastifyInstance } from 'fastify';

import { healthRoutes } from '@/routes/health';

import { RedisClient } from '@infrastructure/cache/redis';
import { PostgresClient } from '@infrastructure/database/postgres';
import { createErrorHandler } from '@infrastructure/http/error-handler';
import { notFoundHandler } from '@infrastructure/http/not-found-handler';
import { registerRequestLogger } from '@infrastructure/http/request-logger';

import { Logger } from '@config/logger';

export interface AppDependencies {
  logger: Logger;
  postgres: PostgresClient;
  redis: RedisClient;
}

export async function buildApp(dependencies: AppDependencies): Promise<FastifyInstance> {
  const { logger, postgres, redis } = dependencies;

  // Create Fastify instance
  const app = Fastify({
    logger: false, // We use our own Pino logger
    disableRequestLogging: false,
  });

  // Register plugins
  await app.register(cors, {
    origin: true,
  });

  // Register request logger middleware
  registerRequestLogger(app, logger);

  // Register error handler
  app.setErrorHandler(createErrorHandler(logger));

  // Register routes
  await app.register(healthRoutes, { dependencies });

  // Register 404 handler (must be last)
  app.setNotFoundHandler(notFoundHandler);

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');
    try {
      await app.close();
      await postgres.disconnect();
      await redis.disconnect();
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return app;
}
