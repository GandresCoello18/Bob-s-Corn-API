import { PrismaClient } from '@prisma/client';

import { IDatabaseRepository } from '@domain/repositories/database-repository.interface';

import { getEnv } from '@config/env';
import { Logger } from '@config/logger';

export class PrismaDatabaseRepository implements IDatabaseRepository {
  private client: PrismaClient;

  constructor(private logger: Logger) {
    const env = getEnv();

    this.client = new PrismaClient({
      log:
        env.NODE_ENV === 'development'
          ? [
              { level: 'query', emit: 'event' },
              { level: 'error', emit: 'stdout' },
              { level: 'warn', emit: 'stdout' },
            ]
          : [{ level: 'error', emit: 'stdout' }],
    });

    if (env.NODE_ENV === 'development') {
      this.client.$on(
        'query' as never,
        (e: { query: string; params: string; duration: number }) => {
          this.logger.debug(
            { query: e.query, params: e.params, duration: `${e.duration}ms` },
            'Database query'
          );
        }
      );
    }

    this.logger.info('Prisma database repository initialized');
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      this.logger.info('Prisma database connection established');
    } catch (err) {
      this.logger.error({ err }, 'Failed to connect to database');
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
    this.logger.info('Prisma database connection closed');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  getClient(): PrismaClient {
    return this.client;
  }
}
