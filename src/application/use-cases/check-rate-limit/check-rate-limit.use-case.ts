import { TooManyRequestsError } from '@/application/errors/app-error';

import { IRateLimiterRepository } from '@domain/repositories/rate-limiter-repository.interface';

import { Logger } from '@config/logger';

import { CheckRateLimitInput } from './check-rate-limit.types';

export class CheckRateLimitUseCase {
  constructor(
    private readonly rateLimiterRepository: IRateLimiterRepository,
    private readonly logger: Logger
  ) {}

  async execute(input: CheckRateLimitInput): Promise<void> {
    const { clientIp, windowSeconds, maxRequests } = input;

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

    await this.rateLimiterRepository.recordRequest(clientIp, windowSeconds);
  }
}
