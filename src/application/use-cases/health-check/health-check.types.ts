export interface HealthCheckResult {
  status: 'ok';
  timestamp: string;
  uptime: number;
  services: {
    database: boolean;
    cache: boolean;
  };
}
