import { loadEnv, getEnv } from './config/env';
import { createLogger } from './config/logger';
import { buildApp } from './app';
import { PostgresClient } from './infrastructure/database/postgres';
import { RedisClient } from './infrastructure/cache/redis';

async function start() {
  try {
    // Load and validate environment variables
    loadEnv();
    const env = getEnv();
    const logger = createLogger();

    logger.info({ env: env.NODE_ENV }, 'Starting application');

    // Initialize infrastructure
    const postgres = new PostgresClient(logger);
    const redis = new RedisClient(logger);

    // Connect to services
    await postgres.connect();
    await redis.connect();

    // Build and start the application
    const dependencies = {
      logger,
      postgres,
      redis,
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

start();

