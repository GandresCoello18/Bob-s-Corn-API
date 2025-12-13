import Redis, { RedisOptions } from 'ioredis';

import { ICacheRepository } from '@domain/repositories/cache-repository.interface';

import { getEnv } from '@config/env';
import { Logger } from '@config/logger';

export class RedisCacheRepository implements ICacheRepository {
  private client: Redis;

  constructor(private logger: Logger) {
    const env = getEnv();

    const config: RedisOptions = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    this.client = new Redis(config);

    this.client.on('connect', () => {
      this.logger.info('Redis client connected');
    });

    this.client.on('error', (err) => {
      this.logger.error({ err }, 'Redis client error');
    });

    this.client.on('close', () => {
      this.logger.info('Redis client connection closed');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.ping();
      this.logger.info('Redis connection established');
    } catch (err) {
      this.logger.error({ err }, 'Failed to connect to Redis');
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    this.logger.info('Redis connection closed');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
