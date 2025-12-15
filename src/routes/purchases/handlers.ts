import { FastifyReply, FastifyRequest } from 'fastify';

import { TooManyRequestsError } from '@/application/errors/app-error';
import { validateRequest } from '@/application/validation/validator';

import { getPurchasesQuerySchema, GetPurchasesQuery } from './schemas';
import { PurchasesRoutesDependencies } from './types';

export function createPurchaseHandler(dependencies: PurchasesRoutesDependencies) {
  const { purchaseCornUseCase, logger } = dependencies;
  const handlerLogger = logger.child({
    service: 'purchases',
    serviceHandler: 'createPurchaseHandler',
  });

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const clientIp = request.ip || 'unknown';

    handlerLogger.info({ clientIp }, 'Executing create purchase handler');

    try {
      const result = await purchaseCornUseCase.execute(clientIp);
      return reply.code(200).send(result);
    } catch (error) {
      handlerLogger.error(
        {
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
          clientIp,
        },
        'Error in create purchase handler'
      );

      if (error instanceof TooManyRequestsError) {
        await purchaseCornUseCase.recordRateLimitedPurchase(clientIp);
      }
      throw error;
    }
  };
}

export function getPurchasesHandler(dependencies: PurchasesRoutesDependencies) {
  const { getPurchasesUseCase, logger } = dependencies;
  const handlerLogger = logger.child({
    service: 'purchases',
    serviceHandler: 'getPurchasesHandler',
  });

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const clientIp = request.ip || 'unknown';

    validateRequest<{ query: GetPurchasesQuery }>(request, {
      query: getPurchasesQuerySchema,
    });

    const query = request.query as GetPurchasesQuery;

    handlerLogger.info({ clientIp, query }, 'Executing get purchases handler');

    try {
      const result = await getPurchasesUseCase.execute({
        clientIp,
        limit: query.limit,
        offset: query.offset,
        status: query.status,
      });

      return reply.code(200).send(result);
    } catch (error) {
      handlerLogger.error(
        {
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
          clientIp,
        },
        'Error in get purchases handler'
      );
      throw error;
    }
  };
}
