/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { FastifyInstance } from 'fastify';

import { DependencyContainer } from '@/application/container/dependency-container';
import { GetPurchasesUseCase } from '@/application/use-cases/get-purchases/get-purchases.use-case';
import { PurchaseCornUseCase } from '@/application/use-cases/purchase-corn/purchase-corn.use-case';
import { healthRoutes } from '@/routes/health';
import { purchasesRoutes } from '@/routes/purchases';

import { createErrorHandler } from '@infrastructure/http/error-handler';
import { notFoundHandler } from '@infrastructure/http/not-found-handler';
import { registerRequestLogger } from '@infrastructure/http/request-logger';

import { HTTP } from '@config/constants';
import { getEnv } from '@config/env';
import { Logger } from '@config/logger';

export interface AppDependencies {
  logger: Logger;
  container: DependencyContainer;
}

export async function buildApp(dependencies: AppDependencies): Promise<FastifyInstance> {
  const { logger, container } = dependencies;
  const env = getEnv();

  const app = Fastify({
    logger: false,
    disableRequestLogging: false,
    bodyLimit: HTTP.BODY_LIMIT,
    requestTimeout: HTTP.REQUEST_TIMEOUT,
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  registerRequestLogger(app, logger);
  app.setErrorHandler(createErrorHandler(logger));

  const healthCheckUseCase = container.getHealthCheckUseCase();
  const purchaseCornUseCase = container.getPurchaseCornUseCase() as PurchaseCornUseCase;
  const getPurchasesUseCase = container.getGetPurchasesUseCase() as GetPurchasesUseCase;

  await app.register(healthRoutes, {
    prefix: '/api/v001',
    dependencies: {
      healthCheckUseCase,
      logger,
    },
  });

  await app.register(purchasesRoutes, {
    prefix: '/api/v001',
    dependencies: {
      getPurchasesUseCase,
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
