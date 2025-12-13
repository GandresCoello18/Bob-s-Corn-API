import { Pool, PoolConfig } from 'pg';
import { getEnv } from '../../config/env';
import { Logger } from '../../config/logger';

export class PostgresClient {
  private pool: Pool;

  constructor(private logger: Logger) {
    const env = getEnv();
    
    const config: PoolConfig = {
      connectionString: env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config);

    this.pool.on('error', (err) => {
      this.logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
    });

    this.logger.info('PostgreSQL client initialized');
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.logger.info('PostgreSQL connection established');
    } catch (err) {
      this.logger.error({ err }, 'Failed to connect to PostgreSQL');
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    this.logger.info('PostgreSQL connection closed');
  }

  getPool(): Pool {
    return this.pool;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1');
      return result.rowCount === 1;
    } catch {
      return false;
    }
  }
}

