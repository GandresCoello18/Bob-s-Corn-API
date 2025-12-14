import { PrismaClient } from '@prisma/client';

import { Logger } from '@config/logger';

export interface PurchaseCornResult {
  success: true;
  message: string;
  timestamp: string;
}

export class PurchaseCornUseCase {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly logger: Logger
  ) {}

  async execute(clientIp: string): Promise<PurchaseCornResult> {
    this.logger.info({ clientIp }, 'Processing corn purchase');

    const purchase = await this.prismaClient.purchase.create({
      data: {
        clientIp,
        status: 'success',
        meta: {},
      },
    });

    this.logger.info({ purchaseId: purchase.id, clientIp }, 'Corn purchased successfully');

    return {
      success: true,
      message: 'Corn purchased successfully from Bob! 🌽',
      timestamp: new Date().toISOString(),
    };
  }
}
