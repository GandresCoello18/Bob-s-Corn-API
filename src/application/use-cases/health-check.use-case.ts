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
    this.logger.debug('Starting health check for all services');

    const checks = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: false,
        cache: false,
      },
    };

    // Check database
    this.logger.debug('Checking database health');
    try {
      checks.services.database = await this.databaseRepository.healthCheck();
      if (checks.services.database) {
        this.logger.debug('Database health check passed');
      } else {
        this.logger.warn('Database health check returned false');
      }
    } catch (err) {
      this.logger.error({ err }, 'Database health check failed');
      checks.services.database = false;
    }

    // Check cache
    this.logger.debug('Checking cache health');
    try {
      checks.services.cache = await this.cacheRepository.healthCheck();
      if (checks.services.cache) {
        this.logger.debug('Cache health check passed');
      } else {
        this.logger.warn('Cache health check returned false');
      }
    } catch (err) {
      this.logger.error({ err }, 'Cache health check failed');
      checks.services.cache = false;
    }

    const allHealthy = checks.services.database && checks.services.cache;
    if (allHealthy) {
      this.logger.info(
        {
          uptime: checks.uptime,
          services: checks.services,
        },
        'All services are healthy'
      );
    } else {
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
