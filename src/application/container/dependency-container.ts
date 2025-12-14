import { ICacheRepository } from '@domain/repositories/cache-repository.interface';
import { IDatabaseRepository } from '@domain/repositories/database-repository.interface';
import { IRateLimiterRepository } from '@domain/repositories/rate-limiter-repository.interface';

import { RedisCacheRepository } from '@infrastructure/cache/redis-cache.repository';
import { RedisRateLimiterRepository } from '@infrastructure/cache/redis-rate-limiter.repository';
import { PrismaDatabaseRepository } from '@infrastructure/database/prisma-database.repository';

import { Logger } from '@config/logger';

import { CheckRateLimitUseCase } from '../use-cases/check-rate-limit.use-case';
import { HealthCheckUseCase } from '../use-cases/health-check.use-case';
import { PurchaseCornUseCase } from '../use-cases/purchase-corn.use-case';

export class DependencyContainer {
  private databaseRepository: IDatabaseRepository | null = null;
  private cacheRepository: ICacheRepository | null = null;
  private rateLimiterRepository: IRateLimiterRepository | null = null;
  private healthCheckUseCase: HealthCheckUseCase | null = null;
  private purchaseCornUseCase: PurchaseCornUseCase | null = null;

  constructor(private logger: Logger) {}

  initializeRepositories(): void {
    this.databaseRepository = new PrismaDatabaseRepository(this.logger);
    this.cacheRepository = new RedisCacheRepository(this.logger);

    const redisClient = (this.cacheRepository as RedisCacheRepository).getClient();
    this.rateLimiterRepository = new RedisRateLimiterRepository(redisClient, this.logger);
  }

  initializeUseCases(): void {
    if (!this.databaseRepository || !this.cacheRepository || !this.rateLimiterRepository) {
      throw new Error('Repositories must be initialized before use cases');
    }

    this.healthCheckUseCase = new HealthCheckUseCase(
      this.databaseRepository,
      this.cacheRepository,
      this.logger
    );

    // Get PrismaClient from PrismaDatabaseRepository for use cases that need direct DB access
    const prismaClient = (this.databaseRepository as PrismaDatabaseRepository).getClient();

    // Initialize rate limiter use case
    const checkRateLimitUseCase = new CheckRateLimitUseCase(
      this.rateLimiterRepository,
      this.logger
    );

    this.purchaseCornUseCase = new PurchaseCornUseCase(
      prismaClient,
      checkRateLimitUseCase,
      this.logger
    );
  }

  getDatabaseRepository(): IDatabaseRepository {
    if (!this.databaseRepository) {
      throw new Error('Database repository not initialized');
    }
    return this.databaseRepository;
  }

  getCacheRepository(): ICacheRepository {
    if (!this.cacheRepository) {
      throw new Error('Cache repository not initialized');
    }
    return this.cacheRepository;
  }

  getHealthCheckUseCase(): HealthCheckUseCase {
    if (!this.healthCheckUseCase) {
      throw new Error('Health check use case not initialized');
    }
    return this.healthCheckUseCase;
  }

  getPurchaseCornUseCase(): PurchaseCornUseCase {
    if (!this.purchaseCornUseCase) {
      throw new Error('Purchase corn use case not initialized');
    }
    return this.purchaseCornUseCase;
  }

  async connectAll(): Promise<void> {
    await Promise.all([
      this.getDatabaseRepository().connect(),
      this.getCacheRepository().connect(),
    ]);
  }

  async disconnectAll(): Promise<void> {
    await Promise.all([
      this.getDatabaseRepository().disconnect(),
      this.getCacheRepository().disconnect(),
    ]);
  }
}
