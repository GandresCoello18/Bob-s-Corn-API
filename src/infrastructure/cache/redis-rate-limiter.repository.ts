import Redis from 'ioredis';

import { IRateLimiterRepository } from '@domain/repositories/rate-limiter-repository.interface';

import { RATE_LIMIT, REDIS } from '@config/constants';
import { Logger } from '@config/logger';

export class RedisRateLimiterRepository implements IRateLimiterRepository {
  constructor(
    private readonly redisClient: Redis,
    private readonly logger: Logger
  ) {}

  async isRateLimited(key: string, windowSeconds: number, maxRequests: number): Promise<boolean> {
    const redisKey = `${RATE_LIMIT.REDIS_KEY_PREFIX}${key}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      await this.redisClient.zremrangebyscore(redisKey, 0, windowStart);
      const count = await this.redisClient.zcard(redisKey);
      const isLimited = count >= maxRequests;

      if (isLimited) {
        this.logger.warn({ key, count, maxRequests, windowSeconds }, 'Rate limit exceeded');
      }

      return isLimited;
    } catch (err) {
      this.logger.error({ err, key }, 'Error checking rate limit, allowing request');
      return false;
    }
  }

  async recordRequest(key: string, windowSeconds: number): Promise<void> {
    const redisKey = `${RATE_LIMIT.REDIS_KEY_PREFIX}${key}`;
    const now = Date.now();

    try {
      await this.redisClient.zadd(redisKey, now, now.toString());
      await this.redisClient.expire(redisKey, windowSeconds + REDIS.KEY_EXPIRY_BUFFER_SECONDS);
    } catch (err) {
      this.logger.error({ err, key }, 'Error recording request for rate limiting');
    }
  }
}
