import { ICacheRepository } from '@domain/repositories/cache-repository.interface';
import { IDatabaseRepository } from '@domain/repositories/database-repository.interface';

import { Logger } from '@config/logger';

export interface HealthCheckResult {
  status: 'ok';
  timestamp: string;
  uptime: number;
  services: {
    database: boolean;
    cache: boolean;
  };
}

export class HealthCheckUseCase {
  constructor(
    private readonly databaseRepository: IDatabaseRepository,
    private readonly cacheRepository: ICacheRepository,
    private readonly logger: Logger
  ) {}

  async execute(): Promise<HealthCheckResult> {
    const checks = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: false,
        cache: false,
      },
    };

    try {
      checks.services.database = await this.databaseRepository.healthCheck();
    } catch (err) {
      this.logger.error({ err }, 'Database health check failed');
    }

    try {
      checks.services.cache = await this.cacheRepository.healthCheck();
    } catch (err) {
      this.logger.error({ err }, 'Cache health check failed');
    }

    return checks;
  }
}
