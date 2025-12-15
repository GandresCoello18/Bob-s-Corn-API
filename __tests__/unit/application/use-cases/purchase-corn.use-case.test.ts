import { PrismaClient } from '@prisma/client';

import { TooManyRequestsError } from '@/application/errors/app-error';
import { CheckRateLimitUseCase } from '@/application/use-cases/check-rate-limit/check-rate-limit.use-case';
import { PurchaseCornUseCase } from '@/application/use-cases/purchase-corn/purchase-corn.use-case';

import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

import { createMockLogger, createMockPrismaClient } from '../../../helpers/mocks';

describe('PurchaseCornUseCase', () => {
  let purchaseCornUseCase: PurchaseCornUseCase;
  let mockPrismaClient: jest.Mocked<PrismaClient>;
  let mockCheckRateLimitUseCase: jest.Mocked<CheckRateLimitUseCase>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  const mockClientIp = '127.0.0.1';
  const mockPurchaseId = 'test-purchase-id';

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockPrismaClient = createMockPrismaClient() as jest.Mocked<PrismaClient>;

    mockCheckRateLimitUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CheckRateLimitUseCase>;

    purchaseCornUseCase = new PurchaseCornUseCase(
      mockPrismaClient,
      mockCheckRateLimitUseCase,
      mockLogger as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create a purchase when rate limit is not exceeded', async () => {
      const mockPurchase = {
        id: mockPurchaseId,
        clientIp: mockClientIp,
        status: PurchaseStatus.SUCCESS,
        createdAt: new Date(),
        meta: {},
      };

      mockCheckRateLimitUseCase.execute.mockResolvedValue(undefined);
      (mockPrismaClient.purchase.create as jest.Mock).mockResolvedValue(mockPurchase);

      const result = await purchaseCornUseCase.execute(mockClientIp);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Corn purchased successfully from Bob! 🌽');
      expect(result.timestamp).toBeDefined();
      expect(mockCheckRateLimitUseCase.execute).toHaveBeenCalledWith({
        clientIp: mockClientIp,
        windowSeconds: expect.any(Number),
        maxRequests: expect.any(Number),
      });
      expect(mockPrismaClient.purchase.create).toHaveBeenCalledWith({
        data: {
          clientIp: mockClientIp,
          status: PurchaseStatus.SUCCESS,
          meta: {},
        },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw TooManyRequestsError when rate limit is exceeded', async () => {
      const rateLimitError = new TooManyRequestsError(
        'Too many requests. Maximum 1 purchase per minute allowed.'
      );
      mockCheckRateLimitUseCase.execute.mockRejectedValue(rateLimitError);

      await expect(purchaseCornUseCase.execute(mockClientIp)).rejects.toThrow(TooManyRequestsError);
      expect(mockCheckRateLimitUseCase.execute).toHaveBeenCalled();
      expect(mockPrismaClient.purchase.create).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockCheckRateLimitUseCase.execute.mockResolvedValue(undefined);
      (mockPrismaClient.purchase.create as jest.Mock).mockRejectedValue(dbError);

      await expect(purchaseCornUseCase.execute(mockClientIp)).rejects.toThrow(dbError);
      expect(mockCheckRateLimitUseCase.execute).toHaveBeenCalled();
      expect(mockPrismaClient.purchase.create).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
