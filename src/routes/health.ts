import { FastifyInstance, FastifyReply } from 'fastify';

import { HealthCheckUseCase } from '@/application/use-cases/health-check.use-case';

interface HealthRoutesDependencies {
  healthCheckUseCase: HealthCheckUseCase;
}

export async function healthRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: HealthRoutesDependencies }
): Promise<void> {
  const { healthCheckUseCase } = opts.dependencies;

  fastify.get('/health', async (_request, reply: FastifyReply) => {
    const result = await healthCheckUseCase.execute();

    const allHealthy = result.services.database && result.services.cache;
    const statusCode = allHealthy ? 200 : 503;

    return reply.code(statusCode).send(result);
  });
}
