import { PrismaClient } from '@prisma/client';

import { GetPurchasesUseCase } from '@/application/use-cases/get-purchases/get-purchases.use-case';

import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

import { createMockLogger, createMockPrismaClient } from '../../../helpers/mocks';

describe('GetPurchasesUseCase', () => {
  let getPurchasesUseCase: GetPurchasesUseCase;
  let mockPrismaClient: jest.Mocked<PrismaClient>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  const mockClientIp = '127.0.0.1';
  const mockPurchases = [
    {
      id: 'purchase-1',
      clientIp: mockClientIp,
      status: PurchaseStatus.SUCCESS,
      createdAt: new Date('2024-01-01'),
      meta: {},
    },
    {
      id: 'purchase-2',
      clientIp: mockClientIp,
      status: PurchaseStatus.SUCCESS,
      createdAt: new Date('2024-01-02'),
      meta: {},
    },
  ];

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockPrismaClient = createMockPrismaClient() as jest.Mocked<PrismaClient>;

    getPurchasesUseCase = new GetPurchasesUseCase(mockPrismaClient, mockLogger as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return purchases with default pagination', async () => {
      (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue(mockPurchases);
      (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(2);

      const result = await getPurchasesUseCase.execute({
        clientIp: mockClientIp,
      });

      expect(result.purchases).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(mockPrismaClient.purchase.findMany).toHaveBeenCalledWith({
        where: { clientIp: mockClientIp },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
      expect(mockPrismaClient.purchase.count).toHaveBeenCalledWith({
        where: { clientIp: mockClientIp },
      });
    });

    it('should return purchases with custom pagination', async () => {
      (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue([mockPurchases[0]]);
      (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(2);

      const result = await getPurchasesUseCase.execute({
        clientIp: mockClientIp,
        limit: 10,
        offset: 1,
      });

      expect(result.purchases).toHaveLength(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(1);
      expect(mockPrismaClient.purchase.findMany).toHaveBeenCalledWith({
        where: { clientIp: mockClientIp },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 1,
      });
    });

    it('should filter purchases by status', async () => {
      (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue([mockPurchases[0]]);
      (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(1);

      const result = await getPurchasesUseCase.execute({
        clientIp: mockClientIp,
        status: PurchaseStatus.SUCCESS,
      });

      expect(result.purchases).toHaveLength(1);
      expect(mockPrismaClient.purchase.findMany).toHaveBeenCalledWith({
        where: { clientIp: mockClientIp, status: PurchaseStatus.SUCCESS },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
      expect(mockPrismaClient.purchase.count).toHaveBeenCalledWith({
        where: { clientIp: mockClientIp, status: PurchaseStatus.SUCCESS },
      });
    });

    it('should clamp limit to maximum value', async () => {
      (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(0);

      const result = await getPurchasesUseCase.execute({
        clientIp: mockClientIp,
        limit: 200,
      });

      expect(result.limit).toBe(100);
      expect(mockPrismaClient.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should clamp limit to minimum value', async () => {
      (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(0);

      const result = await getPurchasesUseCase.execute({
        clientIp: mockClientIp,
        limit: 0,
      });

      expect(result.limit).toBe(1);
      expect(mockPrismaClient.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
        })
      );
    });

    it('should clamp offset to minimum value', async () => {
      (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(0);

      const result = await getPurchasesUseCase.execute({
        clientIp: mockClientIp,
        offset: -10,
      });

      expect(result.offset).toBe(0);
      expect(mockPrismaClient.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
        })
      );
    });
  });
});
