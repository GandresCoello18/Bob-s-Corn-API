import { FastifyReply, FastifyRequest } from 'fastify';

import { TooManyRequestsError } from '@/application/errors/app-error';
import { validateRequest } from '@/application/validation/validator';

import { getPurchasesQuerySchema, GetPurchasesQuery } from './schemas';
import { PurchasesRoutesDependencies } from './types';

/**
 * Handler for POST /purchases - Create a new purchase
 */
export function createPurchaseHandler(dependencies: PurchasesRoutesDependencies) {
  const { purchaseCornUseCase, logger } = dependencies;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
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
      'Received purchase request'
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
        'Purchase request completed successfully'
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
          'Purchase request rate limited'
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
          'Purchase request failed'
        );
      }
      throw error;
    }
  };
}

/**
 * Handler for GET /purchases - Get purchase history
 */
export function getPurchasesHandler(dependencies: PurchasesRoutesDependencies) {
  const { getPurchasesUseCase, logger } = dependencies;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    const clientIp = request.ip || 'unknown';

    validateRequest<{ query: GetPurchasesQuery }>(request, {
      query: getPurchasesQuerySchema,
    });

    const query = request.query as GetPurchasesQuery;

    logger.info(
      {
        method: request.method,
        url: request.url,
        clientIp,
        query,
      },
      'Received get purchases request'
    );

    try {
      const result = await getPurchasesUseCase.execute({
        clientIp,
        limit: query.limit,
        offset: query.offset,
        status: query.status,
      });

      const duration = Date.now() - startTime;
      logger.info(
        {
          method: request.method,
          url: request.url,
          clientIp,
          statusCode: 200,
          duration: `${duration}ms`,
          total: result.total,
          returned: result.purchases.length,
        },
        'Get purchases request completed successfully'
      );

      return reply.code(200).send(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        {
          method: request.method,
          url: request.url,
          clientIp,
          duration: `${duration}ms`,
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        'Get purchases request failed'
      );

      throw error;
    }
  };
}
