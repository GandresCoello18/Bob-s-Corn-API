import Redis from 'ioredis';

import { IRateLimiterRepository } from '@domain/repositories/rate-limiter-repository.interface';

import { Logger } from '@config/logger';

export class RedisRateLimiterRepository implements IRateLimiterRepository {
  constructor(
    private readonly redisClient: Redis,
    private readonly logger: Logger
  ) {}

  async isRateLimited(key: string, windowSeconds: number, maxRequests: number): Promise<boolean> {
    const redisKey = `rate_limit:purchase:${key}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      // Remove entries outside the window (cleanup)
      await this.redisClient.zremrangebyscore(redisKey, 0, windowStart);

      // Count requests in the current window
      const count = await this.redisClient.zcard(redisKey);

      const isLimited = count >= maxRequests;

      if (isLimited) {
        this.logger.debug({ key, count, maxRequests, windowSeconds }, 'Rate limit exceeded');
      }

      return isLimited;
    } catch (err) {
      this.logger.error({ err, key }, 'Error checking rate limit, allowing request');
      // On error, allow the request (fail open)
      return false;
    }
  }

  async recordRequest(key: string, windowSeconds: number): Promise<void> {
    const redisKey = `rate_limit:purchase:${key}`;
    const now = Date.now();

    try {
      // Add current request timestamp to sorted set
      await this.redisClient.zadd(redisKey, now, now.toString());

      // Set expiration on the key (windowSeconds + some buffer)
      await this.redisClient.expire(redisKey, windowSeconds + 10);
    } catch (err) {
      this.logger.error({ err, key }, 'Error recording request for rate limiting');
      // Don't throw - recording is best effort
    }
  }
}
