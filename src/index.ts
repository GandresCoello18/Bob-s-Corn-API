import { buildApp } from '@/app';
import { DependencyContainer } from '@/application/container/dependency-container';

import { loadEnv, getEnv } from '@config/env';
import { createLogger } from '@config/logger';

async function start() {
  try {
    loadEnv();
    const env = getEnv();
    const logger = createLogger();

    logger.info({ env: env.NODE_ENV }, 'Starting application');

    const container = new DependencyContainer(logger);
    container.initializeRepositories();
    container.initializeUseCases();

    await container.connectAll();

    const dependencies = {
      logger,
      container,
    };
    const app = await buildApp(dependencies);

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info({ port: env.PORT, host: env.HOST }, 'Application started');
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

void start();
