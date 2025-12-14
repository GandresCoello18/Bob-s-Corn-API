import { PrismaClient } from '@prisma/client';

import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

import { getEnv } from '@config/env';
import { Logger } from '@config/logger';

export interface Purchase {
  id: string;
  clientIp: string;
  createdAt: Date;
  status: PurchaseStatus;
  meta: unknown;
}

export interface GetPurchasesResult {
  purchases: Purchase[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetPurchasesInput {
  clientIp: string;
  limit?: number;
  offset?: number;
  status?: PurchaseStatus;
}

export class GetPurchasesUseCase {
  private readonly defaultLimit: number = 50;
  private readonly maxLimit: number = 100;
  private readonly isDevelopment: boolean;

  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly logger: Logger
  ) {
    const env = getEnv();
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  async execute(input: GetPurchasesInput): Promise<GetPurchasesResult> {
    const { clientIp, limit = this.defaultLimit, offset = 0, status } = input;

    // Validate and clamp limit
    const validLimit = Math.min(Math.max(1, limit), this.maxLimit);
    const validOffset = Math.max(0, offset);

    if (this.isDevelopment) {
      this.logger.debug(
        { clientIp, limit: validLimit, offset: validOffset, status },
        'Fetching purchases for client'
      );
    }

    // Build where clause
    const where: { clientIp: string; status?: string } = {
      clientIp,
    };

    if (status) {
      where.status = status;
    }

    // Fetch purchases with pagination
    const [purchases, total] = await Promise.all([
      this.prismaClient.purchase.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: validLimit,
        skip: validOffset,
      }),
      this.prismaClient.purchase.count({
        where,
      }),
    ]);

    if (this.isDevelopment) {
      this.logger.debug(
        { clientIp, count: purchases.length, total },
        'Purchases fetched successfully'
      );
    }

    return {
      purchases: purchases.map((purchase) => ({
        id: purchase.id,
        clientIp: purchase.clientIp,
        createdAt: purchase.createdAt,
        status: purchase.status as PurchaseStatus,
        meta: purchase.meta,
      })),
      total,
      limit: validLimit,
      offset: validOffset,
    };
  }
}
