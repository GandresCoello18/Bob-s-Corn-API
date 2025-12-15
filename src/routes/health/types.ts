import { HealthCheckUseCase } from '@/application/use-cases/health-check/health-check.use-case';

import { Logger } from '@config/logger';

export interface HealthRoutesDependencies {
  healthCheckUseCase: HealthCheckUseCase;
  logger: Logger;
}
