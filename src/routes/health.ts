import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { HealthCheckUseCase } from '@/application/use-cases/health-check.use-case';

import { Logger } from '@config/logger';

interface HealthRoutesDependencies {
  healthCheckUseCase: HealthCheckUseCase;
  logger: Logger;
}

export async function healthRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: HealthRoutesDependencies }
): Promise<void> {
  const { healthCheckUseCase, logger } = opts.dependencies;

  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    logger.debug({ method: request.method, url: request.url }, 'Received health check request');

    try {
      const result = await healthCheckUseCase.execute();
      const duration = Date.now() - startTime;
      const allHealthy = result.services.database && result.services.cache;
      const statusCode = allHealthy ? 200 : 503;

      logger.debug(
        {
          method: request.method,
          url: request.url,
          statusCode,
          duration: `${duration}ms`,
          services: result.services,
        },
        'Health check completed'
      );

      return reply.code(statusCode).send(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        {
          method: request.method,
          url: request.url,
          duration: `${duration}ms`,
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        'Health check request failed'
      );

      // Re-throw to let error handler process it
      throw error;
    }
  });
}
