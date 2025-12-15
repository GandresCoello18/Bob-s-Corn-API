import { PrismaClient } from '@prisma/client';

import { CheckRateLimitUseCase } from '@/application/use-cases/check-rate-limit/check-rate-limit.use-case';

import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

import { RATE_LIMIT } from '@config/constants';
import { getEnv } from '@config/env';
import { Logger } from '@config/logger';

import { PurchaseCornResult } from './purchase-corn.types';

export class PurchaseCornUseCase {
  private readonly rateLimitWindowSeconds: number;
  private readonly rateLimitMaxRequests: number;
  private readonly isDevelopment: boolean;

  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly checkRateLimitUseCase: CheckRateLimitUseCase,
    private readonly logger: Logger
  ) {
    const env = getEnv();
    this.rateLimitWindowSeconds =
      env.RATE_LIMIT_WINDOW_SECONDS ?? RATE_LIMIT.DEFAULT_WINDOW_SECONDS;
    this.rateLimitMaxRequests = env.RATE_LIMIT_MAX_REQUESTS ?? RATE_LIMIT.DEFAULT_MAX_REQUESTS;
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  async execute(clientIp: string): Promise<PurchaseCornResult> {
    const startTime = Date.now();
    if (this.isDevelopment) {
      this.logger.info({ clientIp }, 'Starting corn purchase process');
    }

    try {
      if (this.isDevelopment) {
        this.logger.debug({ clientIp }, 'Checking rate limit before purchase');
      }
      await this.checkRateLimitUseCase.execute({
        clientIp,
        windowSeconds: this.rateLimitWindowSeconds,
        maxRequests: this.rateLimitMaxRequests,
      });
      if (this.isDevelopment) {
        this.logger.debug({ clientIp }, 'Rate limit check passed, proceeding with purchase');
      }

      if (this.isDevelopment) {
        this.logger.debug({ clientIp }, 'Creating purchase record in database');
      }
      const purchase = await this.prismaClient.purchase.create({
        data: {
          clientIp,
          status: PurchaseStatus.SUCCESS,
          meta: {},
        },
      });

      const duration = Date.now() - startTime;
      this.logger.info(
        {
          purchaseId: purchase.id,
          clientIp,
          duration: `${duration}ms`,
        },
        'Corn purchased successfully from Bob! 🌽'
      );

      return {
        success: true,
        message: 'Corn purchased successfully from Bob! 🌽',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          err: error,
          clientIp,
          duration: `${duration}ms`,
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        'Error during corn purchase process'
      );

      throw error;
    }
  }
}
