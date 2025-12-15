/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { FastifyReply } from 'fastify';

import { HealthRoutesDependencies } from './types';

export function healthCheckHandler(dependencies: HealthRoutesDependencies) {
  const { healthCheckUseCase, logger } = dependencies;
  const handlerLogger = logger.child({
    service: 'health',
    serviceHandler: 'healthCheckHandler',
  });

  return async (_request: unknown, reply: FastifyReply) => {
    handlerLogger.info('Executing health check handler');

    try {
      const result = await healthCheckUseCase.execute();
      const allHealthy = result.services.database && result.services.cache;
      const statusCode = allHealthy ? 200 : 503;

      return reply.code(statusCode).send(result);
    } catch (error) {
      handlerLogger.error(
        {
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        'Error in health check handler'
      );
      throw error;
    }
  };
}
