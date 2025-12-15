/* eslint-disable @typescript-eslint/require-await */
import { FastifyInstance } from 'fastify';

import { healthCheckHandler } from './handlers';
import { HealthRoutesDependencies } from './types';

export async function healthRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: HealthRoutesDependencies }
): Promise<void> {
  const { dependencies } = opts;
  fastify.get('/health', healthCheckHandler(dependencies));
}
