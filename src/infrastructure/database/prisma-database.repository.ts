import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool, PoolConfig } from 'pg';

import { IDatabaseRepository } from '@domain/repositories/database-repository.interface';

import { DATABASE } from '@config/constants';
import { getEnv } from '@config/env';
import { Logger } from '@config/logger';

export class PrismaDatabaseRepository implements IDatabaseRepository {
  private client: PrismaClient;
  private pool: Pool;

  constructor(private logger: Logger) {
    const env = getEnv();

    const poolConfig: PoolConfig = {
      connectionString: env.DATABASE_URL,
      max: env.DB_POOL_MAX ?? DATABASE.POOL.MAX_CONNECTIONS,
      min: env.DB_POOL_MIN ?? DATABASE.POOL.MIN_CONNECTIONS,
      idleTimeoutMillis: DATABASE.POOL.IDLE_TIMEOUT,
      connectionTimeoutMillis: DATABASE.POOL.CONNECTION_TIMEOUT,
    };

    this.pool = new Pool(poolConfig);
    const adapter = new PrismaPg(this.pool);
    const isDevelopment = env.NODE_ENV === 'development';

    this.client = new PrismaClient({
      adapter,
      log: isDevelopment
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
    });

    if (isDevelopment) {
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

    this.logger.info(
      {
        maxConnections: poolConfig.max,
        minConnections: poolConfig.min,
      },
      'Prisma database repository initialized'
    );
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
    await this.pool.end();
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
