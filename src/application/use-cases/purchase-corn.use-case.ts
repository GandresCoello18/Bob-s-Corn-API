import { PrismaClient } from '@prisma/client';

import { CheckRateLimitUseCase } from '@/application/use-cases/check-rate-limit.use-case';

import { Logger } from '@config/logger';

export interface PurchaseCornResult {
  success: true;
  message: string;
  timestamp: string;
}

export class PurchaseCornUseCase {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly checkRateLimitUseCase: CheckRateLimitUseCase,
    private readonly logger: Logger
  ) {}

  async execute(clientIp: string): Promise<PurchaseCornResult> {
    const startTime = Date.now();
    this.logger.info({ clientIp }, 'Starting corn purchase process');

    try {
      // Check rate limit: 1 purchase per minute (60 seconds)
      this.logger.debug({ clientIp }, 'Checking rate limit before purchase');
      await this.checkRateLimitUseCase.execute({
        clientIp,
        windowSeconds: 60,
        maxRequests: 1,
      });
      this.logger.debug({ clientIp }, 'Rate limit check passed, proceeding with purchase');

      // Create purchase record
      this.logger.debug({ clientIp }, 'Creating purchase record in database');
      const purchase = await this.prismaClient.purchase.create({
        data: {
          clientIp,
          status: 'success',
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

      // Re-throw to let error handler process it
      throw error;
    }
  }
}
