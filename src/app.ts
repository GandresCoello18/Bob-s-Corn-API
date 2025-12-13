import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { Logger } from './config/logger';
import { PostgresClient } from './infrastructure/database/postgres';
import { RedisClient } from './infrastructure/cache/redis';
import { healthRoutes } from './routes/health';

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

  // Register routes
  await app.register(healthRoutes, { dependencies });

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

