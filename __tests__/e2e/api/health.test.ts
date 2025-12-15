import { buildApp } from '@/app';
import { DependencyContainer } from '@/application/container/dependency-container';
import { HealthCheckUseCase } from '@/application/use-cases/health-check/health-check.use-case';

import { createLogger } from '@config/logger';

import {
  createMockLogger,
  createMockDatabaseRepository,
  createMockCacheRepository,
} from '../../helpers/mocks';

describe('E2E: GET /api/v001/health', () => {
  let app: any;
  let mockDatabaseRepository: ReturnType<typeof createMockDatabaseRepository>;
  let mockCacheRepository: ReturnType<typeof createMockCacheRepository>;

  beforeEach(async () => {
    mockDatabaseRepository = createMockDatabaseRepository();
    mockCacheRepository = createMockCacheRepository();
    const mockLogger = createMockLogger();

    mockDatabaseRepository.healthCheck.mockResolvedValue(true);
    mockCacheRepository.healthCheck.mockResolvedValue(true);

    const healthCheckUseCase = new HealthCheckUseCase(
      mockDatabaseRepository as any,
      mockCacheRepository as any,
      mockLogger as any
    );

    const logger = createLogger();
    const container = new DependencyContainer(logger);

    const mockPurchaseCornUseCase = {
      execute: jest.fn(),
    } as unknown as any;

    const mockGetPurchasesUseCase = {
      execute: jest.fn(),
    } as unknown as any;

    jest.spyOn(container, 'getHealthCheckUseCase').mockReturnValue(healthCheckUseCase);
    jest.spyOn(container, 'getPurchaseCornUseCase').mockReturnValue(mockPurchaseCornUseCase);
    jest.spyOn(container, 'getGetPurchasesUseCase').mockReturnValue(mockGetPurchasesUseCase);

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

  describe('GET /api/v001/health', () => {
    it('should return 200 when all services are healthy', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v001/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.services.database).toBe(true);
      expect(body.services.cache).toBe(true);
      expect(body.timestamp).toBeDefined();
      expect(body.uptime).toBeDefined();
    });

    it('should return 503 when database is unhealthy', async () => {
      mockDatabaseRepository.healthCheck.mockResolvedValue(false);
      mockCacheRepository.healthCheck.mockResolvedValue(true);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v001/health',
      });

      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.body);
      expect(body.services.database).toBe(false);
      expect(body.services.cache).toBe(true);
    });

    it('should return 503 when cache is unhealthy', async () => {
      mockDatabaseRepository.healthCheck.mockResolvedValue(true);
      mockCacheRepository.healthCheck.mockResolvedValue(false);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v001/health',
      });

      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.body);
      expect(body.services.database).toBe(true);
      expect(body.services.cache).toBe(false);
    });

    it('should handle service errors gracefully', async () => {
      mockDatabaseRepository.healthCheck.mockRejectedValue(new Error('Database connection failed'));
      mockCacheRepository.healthCheck.mockResolvedValue(true);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v001/health',
      });

      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.body);
      expect(body.services.database).toBe(false);
      expect(body.services.cache).toBe(true);
    });
  });
});
