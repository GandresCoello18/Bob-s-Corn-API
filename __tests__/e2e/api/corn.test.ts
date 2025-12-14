import { FastifyInstance } from 'fastify';

import { buildApp } from '@/app';
import { DependencyContainer } from '@/application/container/dependency-container';
import { CheckRateLimitUseCase } from '@/application/use-cases/check-rate-limit.use-case';
import { GetPurchasesUseCase } from '@/application/use-cases/get-purchases.use-case';
import { HealthCheckUseCase } from '@/application/use-cases/health-check.use-case';
import { PurchaseCornUseCase } from '@/application/use-cases/purchase-corn.use-case';

import { createLogger } from '@config/logger';

import {
  createMockLogger,
  createMockPrismaClient,
  createMockRateLimiterRepository,
} from '../../helpers/mocks';

describe('E2E: POST /api/v001/corn', () => {
  let app: FastifyInstance;
  let mockPrismaClient: ReturnType<typeof createMockPrismaClient>;
  let mockRateLimiterRepository: ReturnType<typeof createMockRateLimiterRepository>;

  const mockClientIp = '127.0.0.1';

  beforeEach(async () => {
    mockPrismaClient = createMockPrismaClient();
    mockRateLimiterRepository = createMockRateLimiterRepository();
    const mockLogger = createMockLogger();

    mockRateLimiterRepository.isRateLimited.mockResolvedValue(false);
    mockRateLimiterRepository.recordRequest.mockResolvedValue(undefined);
    (mockPrismaClient.purchase.create as jest.Mock).mockResolvedValue({
      id: 'test-purchase-id',
      clientIp: mockClientIp,
      status: 'success',
      createdAt: new Date(),
      meta: {},
    });

    const checkRateLimitUseCase = new CheckRateLimitUseCase(
      mockRateLimiterRepository as any,
      mockLogger as any
    );

    const purchaseCornUseCase = new PurchaseCornUseCase(
      mockPrismaClient,
      checkRateLimitUseCase,
      mockLogger as any
    );

    const logger = createLogger();
    const appContainer = new DependencyContainer(logger);
    const mockHealthCheckUseCase = {
      execute: jest.fn().mockResolvedValue({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 0,
        services: { database: true, cache: true },
      }),
    } as unknown as HealthCheckUseCase;

    const mockGetPurchasesUseCase = {
      execute: jest.fn(),
    } as unknown as GetPurchasesUseCase;

    jest.spyOn(appContainer, 'getPurchaseCornUseCase').mockReturnValue(purchaseCornUseCase);
    jest.spyOn(appContainer, 'getHealthCheckUseCase').mockReturnValue(mockHealthCheckUseCase);
    jest.spyOn(appContainer, 'getGetPurchasesUseCase').mockReturnValue(mockGetPurchasesUseCase);

    app = await buildApp({
      logger,
      container: appContainer,
    });

    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /api/v001/corn', () => {
    it('should successfully purchase corn', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v001/corn',
        headers: {
          'x-forwarded-for': mockClientIp,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Corn purchased successfully');
      expect(body.timestamp).toBeDefined();
      expect(mockPrismaClient.purchase.create).toHaveBeenCalled();
    });

    it('should return 429 when rate limit is exceeded', async () => {
      mockRateLimiterRepository.isRateLimited.mockResolvedValue(true);

      const response = await app.inject({
        method: 'POST',
        url: '/api/v001/corn',
        headers: {
          'x-forwarded-for': mockClientIp,
        },
      });

      expect(response.statusCode).toBe(429);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('TOO_MANY_REQUESTS');
      expect(body.error.message).toContain('Too many requests');
      expect(mockPrismaClient.purchase.create).not.toHaveBeenCalled();
    });

    it('should extract client IP from request', async () => {
      const testIp = '192.168.1.1';
      await app.inject({
        method: 'POST',
        url: '/api/v001/corn',
        headers: {
          'x-forwarded-for': testIp,
        },
      });

      expect(mockRateLimiterRepository.isRateLimited).toHaveBeenCalled();
    });
  });
});
