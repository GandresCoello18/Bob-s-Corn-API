import { TooManyRequestsError } from '@/application/errors/app-error';

import { IRateLimiterRepository } from '@domain/repositories/rate-limiter-repository.interface';

import { getEnv } from '@config/env';
import { Logger } from '@config/logger';

import { CheckRateLimitInput } from './check-rate-limit.types';

export class CheckRateLimitUseCase {
  private readonly isDevelopment: boolean;

  constructor(
    private readonly rateLimiterRepository: IRateLimiterRepository,
    private readonly logger: Logger
  ) {
    const env = getEnv();
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  async execute(input: CheckRateLimitInput): Promise<void> {
    const { clientIp, windowSeconds, maxRequests } = input;

    if (this.isDevelopment) {
      this.logger.debug({ clientIp, windowSeconds, maxRequests }, 'Checking rate limit for client');
    }

    const isLimited = await this.rateLimiterRepository.isRateLimited(
      clientIp,
      windowSeconds,
      maxRequests
    );

    if (isLimited) {
      this.logger.warn(
        {
          clientIp,
          windowSeconds,
          maxRequests,
        },
        'Rate limit exceeded for client - blocking request'
      );
      throw new TooManyRequestsError('Too many requests. Maximum 1 purchase per minute allowed.');
    }

    if (this.isDevelopment) {
      this.logger.debug(
        {
          clientIp,
          windowSeconds,
          maxRequests,
        },
        'Rate limit check passed for client'
      );
    }

    await this.rateLimiterRepository.recordRequest(clientIp, windowSeconds);
    if (this.isDevelopment) {
      this.logger.debug({ clientIp }, 'Request recorded in rate limiter');
    }
  }
}
