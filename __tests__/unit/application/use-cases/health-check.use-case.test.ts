import { HealthCheckUseCase } from '@/application/use-cases/health-check.use-case';

import { ICacheRepository } from '@domain/repositories/cache-repository.interface';
import { IDatabaseRepository } from '@domain/repositories/database-repository.interface';

import {
  createMockLogger,
  createMockDatabaseRepository,
  createMockCacheRepository,
} from '../../../helpers/mocks';

describe('HealthCheckUseCase', () => {
  let healthCheckUseCase: HealthCheckUseCase;
  let mockDatabaseRepository: jest.Mocked<IDatabaseRepository>;
  let mockCacheRepository: jest.Mocked<ICacheRepository>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockDatabaseRepository = createMockDatabaseRepository() as jest.Mocked<IDatabaseRepository>;
    mockCacheRepository = createMockCacheRepository() as jest.Mocked<ICacheRepository>;

    healthCheckUseCase = new HealthCheckUseCase(
      mockDatabaseRepository,
      mockCacheRepository,
      mockLogger as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return healthy status when all services are healthy', async () => {
      mockDatabaseRepository.healthCheck.mockResolvedValue(true);
      mockCacheRepository.healthCheck.mockResolvedValue(true);

      const result = await healthCheckUseCase.execute();

      expect(result.status).toBe('ok');
      expect(result.services.database).toBe(true);
      expect(result.services.cache).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should return unhealthy status when database is down', async () => {
      mockDatabaseRepository.healthCheck.mockResolvedValue(false);
      mockCacheRepository.healthCheck.mockResolvedValue(true);

      const result = await healthCheckUseCase.execute();

      expect(result.services.database).toBe(false);
      expect(result.services.cache).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return unhealthy status when cache is down', async () => {
      mockDatabaseRepository.healthCheck.mockResolvedValue(true);
      mockCacheRepository.healthCheck.mockResolvedValue(false);

      const result = await healthCheckUseCase.execute();

      expect(result.services.database).toBe(true);
      expect(result.services.cache).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle database health check errors', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseRepository.healthCheck.mockRejectedValue(dbError);
      mockCacheRepository.healthCheck.mockResolvedValue(true);

      const result = await healthCheckUseCase.execute();

      expect(result.services.database).toBe(false);
      expect(result.services.cache).toBe(true);
      expect(mockLogger.error).toHaveBeenCalledWith(
        { err: dbError },
        'Database health check failed'
      );
    });

    it('should handle cache health check errors', async () => {
      const cacheError = new Error('Cache connection failed');
      mockDatabaseRepository.healthCheck.mockResolvedValue(true);
      mockCacheRepository.healthCheck.mockRejectedValue(cacheError);

      const result = await healthCheckUseCase.execute();

      expect(result.services.database).toBe(true);
      expect(result.services.cache).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        { err: cacheError },
        'Cache health check failed'
      );
    });

    it('should handle both services failing', async () => {
      mockDatabaseRepository.healthCheck.mockResolvedValue(false);
      mockCacheRepository.healthCheck.mockResolvedValue(false);

      const result = await healthCheckUseCase.execute();

      expect(result.services.database).toBe(false);
      expect(result.services.cache).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
