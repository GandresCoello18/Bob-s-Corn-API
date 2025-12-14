/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import cors from '@fastify/cors';
import Fastify, { FastifyInstance } from 'fastify';

import { DependencyContainer } from '@/application/container/dependency-container';
import { PurchaseCornUseCase } from '@/application/use-cases/purchase-corn.use-case';
import { cornRoutes } from '@/routes/corn';
import { healthRoutes } from '@/routes/health';

import { createErrorHandler } from '@infrastructure/http/error-handler';
import { notFoundHandler } from '@infrastructure/http/not-found-handler';
import { registerRequestLogger } from '@infrastructure/http/request-logger';

import { Logger } from '@config/logger';

export interface AppDependencies {
  logger: Logger;
  container: DependencyContainer;
}

export async function buildApp(dependencies: AppDependencies): Promise<FastifyInstance> {
  const { logger, container } = dependencies;

  const app = Fastify({
    logger: false,
    disableRequestLogging: false,
  });

  await app.register(cors, {
    origin: true,
  });

  registerRequestLogger(app, logger);
  app.setErrorHandler(createErrorHandler(logger));

  const healthCheckUseCase = container.getHealthCheckUseCase();
  const purchaseCornUseCase = container.getPurchaseCornUseCase() as PurchaseCornUseCase;

  await app.register(healthRoutes, {
    prefix: '/api/v001',
    dependencies: {
      healthCheckUseCase,
      logger,
    },
  });

  await app.register(cornRoutes, {
    prefix: '/api/v001',
    dependencies: {
      purchaseCornUseCase,
      logger,
    },
  });

  app.setNotFoundHandler(notFoundHandler);

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');
    try {
      await app.close();
      await container.disconnectAll();
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return app;
}
