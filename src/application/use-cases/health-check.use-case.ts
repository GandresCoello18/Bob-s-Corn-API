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

    // Check database - only log errors, not debug info
    try {
      checks.services.database = await this.databaseRepository.healthCheck();
      if (!checks.services.database) {
        this.logger.warn('Database health check returned false');
      }
    } catch (err) {
      this.logger.error({ err }, 'Database health check failed');
      checks.services.database = false;
    }

    // Check cache - only log errors, not debug info
    try {
      checks.services.cache = await this.cacheRepository.healthCheck();
      if (!checks.services.cache) {
        this.logger.warn('Cache health check returned false');
      }
    } catch (err) {
      this.logger.error({ err }, 'Cache health check failed');
      checks.services.cache = false;
    }

    const allHealthy = checks.services.database && checks.services.cache;
    // Only log warnings when services are unhealthy (reduce log noise in production)
    if (!allHealthy) {
      this.logger.warn(
        {
          uptime: checks.uptime,
          services: checks.services,
        },
        'Some services are unhealthy'
      );
    }

    return checks;
  }
}
