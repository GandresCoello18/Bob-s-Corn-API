import { TooManyRequestsError } from '@/application/errors/app-error';
import { CheckRateLimitUseCase } from '@/application/use-cases/check-rate-limit.use-case';

import { IRateLimiterRepository } from '@domain/repositories/rate-limiter-repository.interface';

import { createMockLogger, createMockRateLimiterRepository } from '../../../helpers/mocks';

describe('CheckRateLimitUseCase', () => {
  let checkRateLimitUseCase: CheckRateLimitUseCase;
  let mockRateLimiterRepository: jest.Mocked<IRateLimiterRepository>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  const mockClientIp = '127.0.0.1';
  const mockWindowSeconds = 60;
  const mockMaxRequests = 1;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRateLimiterRepository =
      createMockRateLimiterRepository() as jest.Mocked<IRateLimiterRepository>;

    checkRateLimitUseCase = new CheckRateLimitUseCase(mockRateLimiterRepository, mockLogger as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should pass when rate limit is not exceeded', async () => {
      mockRateLimiterRepository.isRateLimited.mockResolvedValue(false);
      mockRateLimiterRepository.recordRequest.mockResolvedValue(undefined);

      await checkRateLimitUseCase.execute({
        clientIp: mockClientIp,
        windowSeconds: mockWindowSeconds,
        maxRequests: mockMaxRequests,
      });

      expect(mockRateLimiterRepository.isRateLimited).toHaveBeenCalledWith(
        mockClientIp,
        mockWindowSeconds,
        mockMaxRequests
      );
      expect(mockRateLimiterRepository.recordRequest).toHaveBeenCalledWith(
        mockClientIp,
        mockWindowSeconds
      );
    });

    it('should throw TooManyRequestsError when rate limit is exceeded', async () => {
      mockRateLimiterRepository.isRateLimited.mockResolvedValue(true);

      await expect(
        checkRateLimitUseCase.execute({
          clientIp: mockClientIp,
          windowSeconds: mockWindowSeconds,
          maxRequests: mockMaxRequests,
        })
      ).rejects.toThrow(TooManyRequestsError);

      expect(mockRateLimiterRepository.isRateLimited).toHaveBeenCalledWith(
        mockClientIp,
        mockWindowSeconds,
        mockMaxRequests
      );
      expect(mockRateLimiterRepository.recordRequest).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Redis connection failed');
      mockRateLimiterRepository.isRateLimited.mockRejectedValue(repositoryError);

      await expect(
        checkRateLimitUseCase.execute({
          clientIp: mockClientIp,
          windowSeconds: mockWindowSeconds,
          maxRequests: mockMaxRequests,
        })
      ).rejects.toThrow(repositoryError);

      expect(mockRateLimiterRepository.isRateLimited).toHaveBeenCalled();
      expect(mockRateLimiterRepository.recordRequest).not.toHaveBeenCalled();
    });
  });
});
