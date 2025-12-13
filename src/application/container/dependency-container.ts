import { ICacheRepository } from '@domain/repositories/cache-repository.interface';
import { IDatabaseRepository } from '@domain/repositories/database-repository.interface';

import { RedisCacheRepository } from '@infrastructure/cache/redis-cache.repository';
import { PrismaDatabaseRepository } from '@infrastructure/database/prisma-database.repository';

import { Logger } from '@config/logger';

import { HealthCheckUseCase } from '../use-cases/health-check.use-case';

export class DependencyContainer {
  private databaseRepository: IDatabaseRepository | null = null;
  private cacheRepository: ICacheRepository | null = null;
  private healthCheckUseCase: HealthCheckUseCase | null = null;

  constructor(private logger: Logger) {}

  initializeRepositories(): void {
    this.databaseRepository = new PrismaDatabaseRepository(this.logger);
    this.cacheRepository = new RedisCacheRepository(this.logger);
  }

  initializeUseCases(): void {
    if (!this.databaseRepository || !this.cacheRepository) {
      throw new Error('Repositories must be initialized before use cases');
    }

    this.healthCheckUseCase = new HealthCheckUseCase(
      this.databaseRepository,
      this.cacheRepository,
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
