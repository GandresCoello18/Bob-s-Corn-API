/* eslint-disable @typescript-eslint/require-await */
import { FastifyInstance } from 'fastify';

import { createPurchaseHandler, getPurchasesHandler } from './handlers';
import { PurchasesRoutesDependencies } from './types';

export async function purchasesRoutes(
  fastify: FastifyInstance,
  opts: { dependencies: PurchasesRoutesDependencies }
): Promise<void> {
  const { dependencies } = opts;
  const basePathPurchases = '/purchases';
  fastify.post(basePathPurchases, createPurchaseHandler(dependencies));
  fastify.get(basePathPurchases, getPurchasesHandler(dependencies));
}
