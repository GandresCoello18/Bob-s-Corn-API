import { FastifyInstance, FastifyReply } from 'fastify';

import { RedisClient } from '@infrastructure/cache/redis';
import { PostgresClient } from '@infrastructure/database/postgres';

import { Logger } from '@config/logger';

interface HealthCheckDependencies {
  logger: Logger;
  postgres: PostgresClient;
  redis: RedisClient;
}

export async function healthRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: HealthCheckDependencies }
): Promise<void> {
  const { logger, postgres, redis } = opts.dependencies;

  fastify.get('/health', async (_request, reply: FastifyReply) => {
    const checks = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: false,
        cache: false,
      },
    };

    // Check PostgreSQL
    try {
      checks.services.database = await postgres.healthCheck();
    } catch (err) {
      logger.error({ err }, 'Database health check failed');
    }

    // Check Redis
    try {
      checks.services.cache = await redis.healthCheck();
    } catch (err) {
      logger.error({ err }, 'Redis health check failed');
    }

    const allHealthy = checks.services.database && checks.services.cache;
    const statusCode = allHealthy ? 200 : 503;

    return reply.code(statusCode).send(checks);
  });
}
