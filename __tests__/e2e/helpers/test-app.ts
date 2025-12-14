import { buildApp } from '@/app';
import { DependencyContainer } from '@/application/container/dependency-container';

import { createLogger } from '@config/logger';

export async function createTestApp() {
  const logger = createLogger();
  const container = new DependencyContainer(logger);
  container.initializeRepositories();
  container.initializeUseCases();

  const app = await buildApp({
    logger,
    container,
  });

  return { app, container, logger };
}
