import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { GetPurchasesUseCase } from '@/application/use-cases/get-purchases.use-case';
import { validateRequest } from '@/application/validation/validator';

import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

import { Logger } from '@config/logger';

interface PurchasesRoutesDependencies {
  getPurchasesUseCase: GetPurchasesUseCase;
  logger: Logger;
}

const getPurchasesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z
    .enum([PurchaseStatus.SUCCESS, PurchaseStatus.RATE_LIMITED, PurchaseStatus.FAILED])
    .optional(),
});

interface GetPurchasesQuery {
  limit?: number;
  offset?: number;
  status?: PurchaseStatus;
}

export async function purchasesRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: PurchasesRoutesDependencies }
): Promise<void> {
  const { getPurchasesUseCase, logger } = opts.dependencies;

  fastify.get('/purchases', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    const clientIp = request.ip || 'unknown';

    validateRequest<GetPurchasesQuery>(request, {
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

      // Re-throw to let error handler process it
      throw error;
    }
  });
}
