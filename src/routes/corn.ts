import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { PurchaseCornUseCase } from '@/application/use-cases/purchase-corn.use-case';
import { TooManyRequestsError } from '@/application/errors/app-error';

import { Logger } from '@config/logger';

interface CornRoutesDependencies {
  purchaseCornUseCase: PurchaseCornUseCase;
  logger: Logger;
}

export async function cornRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: CornRoutesDependencies }
): Promise<void> {
  const { purchaseCornUseCase, logger } = opts.dependencies;

  fastify.post('/corn', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    // Extract client IP address
    const clientIp = request.ip || 'unknown';

    logger.info(
      {
        method: request.method,
        url: request.url,
        clientIp,
        headers: {
          'user-agent': request.headers['user-agent'],
        },
      },
      'Received corn purchase request'
    );

    try {
      const result = await purchaseCornUseCase.execute(clientIp);
      const duration = Date.now() - startTime;

      logger.info(
        {
          method: request.method,
          url: request.url,
          clientIp,
          statusCode: 200,
          duration: `${duration}ms`,
          success: result.success,
        },
        'Corn purchase request completed successfully'
      );

      return reply.code(200).send(result);
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof TooManyRequestsError) {
        logger.warn(
          {
            method: request.method,
            url: request.url,
            clientIp,
            statusCode: 429,
            duration: `${duration}ms`,
            errorName: error.name,
          },
          'Corn purchase request rate limited'
        );
      } else {
        logger.error(
          {
            method: request.method,
            url: request.url,
            clientIp,
            duration: `${duration}ms`,
            errorName: error instanceof Error ? error.name : 'UnknownError',
            errorMessage: error instanceof Error ? error.message : String(error),
          },
          'Corn purchase request failed'
        );
      }

      // Re-throw to let error handler process it
      throw error;
    }
  });
}
