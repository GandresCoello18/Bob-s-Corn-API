import { FastifyReply, FastifyRequest } from 'fastify';

import { HealthRoutesDependencies } from './types';

export function healthCheckHandler(dependencies: HealthRoutesDependencies) {
  const { healthCheckUseCase, logger } = dependencies;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();

    try {
      const result = await healthCheckUseCase.execute();
      const duration = Date.now() - startTime;
      const allHealthy = result.services.database && result.services.cache;
      const statusCode = allHealthy ? 200 : 503;

      if (!allHealthy) {
        logger.warn(
          {
            method: request.method,
            url: request.url,
            statusCode,
            duration: `${duration}ms`,
            services: result.services,
          },
          'Health check failed - some services are unhealthy'
        );
      }

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
      throw error;
    }
  };
}
