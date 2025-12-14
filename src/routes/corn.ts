import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { PurchaseCornUseCase } from '@/application/use-cases/purchase-corn.use-case';

interface CornRoutesDependencies {
  purchaseCornUseCase: PurchaseCornUseCase;
}

export async function cornRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: CornRoutesDependencies }
): Promise<void> {
  const { purchaseCornUseCase } = opts.dependencies;

  fastify.post('/corn', async (request: FastifyRequest, reply: FastifyReply) => {
    // Extract client IP address
    const clientIp = request.ip || 'unknown';

    const result = await purchaseCornUseCase.execute(clientIp);

    return reply.code(200).send(result);
  });
}
