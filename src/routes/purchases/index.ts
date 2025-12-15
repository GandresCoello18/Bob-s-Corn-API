/* eslint-disable @typescript-eslint/require-await */
import { FastifyInstance } from 'fastify';

import { createPurchaseHandler, getPurchasesHandler } from './handlers';
import { PurchasesRoutesDependencies } from './types';

export async function purchasesRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: PurchasesRoutesDependencies }
): Promise<void> {
  const { dependencies } = opts;
  fastify.post('/purchases', createPurchaseHandler(dependencies));
  fastify.get('/purchases', getPurchasesHandler(dependencies));
}
