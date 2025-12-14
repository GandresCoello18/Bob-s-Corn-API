import { buildApp } from '@/app';
import { DependencyContainer } from '@/application/container/dependency-container';
import { GetPurchasesUseCase } from '@/application/use-cases/get-purchases.use-case';

import { PurchaseStatus } from '@domain/enums/purchase-status.enum';

import { createLogger } from '@config/logger';

import { createMockLogger, createMockPrismaClient } from '../../helpers/mocks';

describe('E2E: GET /api/v001/purchases', () => {
  let app: any;
  let mockPrismaClient: ReturnType<typeof createMockPrismaClient>;

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

  beforeEach(async () => {
    mockPrismaClient = createMockPrismaClient();
    const mockLogger = createMockLogger();

    (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue(mockPurchases);
    (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(2);

    const getPurchasesUseCase = new GetPurchasesUseCase(mockPrismaClient, mockLogger as any);

    const logger = createLogger();
    const container = new DependencyContainer(logger);

    const mockPurchaseCornUseCase = {
      execute: jest.fn(),
    } as unknown as any;

    const mockHealthCheckUseCase = {
      execute: jest.fn().mockResolvedValue({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 0,
        services: { database: true, cache: true },
      }),
    } as unknown as any;

    jest.spyOn(container, 'getGetPurchasesUseCase').mockReturnValue(getPurchasesUseCase);
    jest.spyOn(container, 'getPurchaseCornUseCase').mockReturnValue(mockPurchaseCornUseCase);
    jest.spyOn(container, 'getHealthCheckUseCase').mockReturnValue(mockHealthCheckUseCase);

    app = await buildApp({
      logger,
      container,
    });

    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /api/v001/purchases', () => {
    it('should return purchases for the client IP', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v001/purchases',
        headers: {
          'x-forwarded-for': mockClientIp,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.purchases).toHaveLength(2);
      expect(body.total).toBe(2);
      expect(body.limit).toBe(50);
      expect(body.offset).toBe(0);
      expect(mockPrismaClient.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clientIp: mockClientIp },
        })
      );
    });

    it('should support pagination with limit and offset', async () => {
      (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue([mockPurchases[0]]);
      (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(2);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v001/purchases?limit=1&offset=0',
        headers: {
          'x-forwarded-for': mockClientIp,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.purchases).toHaveLength(1);
      expect(body.limit).toBe(1);
      expect(body.offset).toBe(0);
    });

    it('should filter by status when provided', async () => {
      (mockPrismaClient.purchase.findMany as jest.Mock).mockResolvedValue([mockPurchases[0]]);
      (mockPrismaClient.purchase.count as jest.Mock).mockResolvedValue(1);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v001/purchases?status=success',
        headers: {
          'x-forwarded-for': mockClientIp,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.purchases).toHaveLength(1);
      expect(mockPrismaClient.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clientIp: mockClientIp, status: PurchaseStatus.SUCCESS },
        })
      );
    });

    it('should validate query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v001/purchases?limit=invalid',
        headers: {
          'x-forwarded-for': mockClientIp,
        },
      });

      expect(response.statusCode).toBe(422);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
