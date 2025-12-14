import { resolve } from 'path';

import { config } from 'dotenv';
import { z } from 'zod';

function getEnvFilePath(): string {
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  const envFile = appEnv === 'production' ? '.env.prod' : '.env.dev';
  return resolve(process.cwd(), envFile);
}

const envFilePath = getEnvFilePath();
config({ path: envFilePath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // PostgreSQL
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().regex(/^\d+$/).transform(Number).default('0'),

  // Logging
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info')
    .transform((val) => {
      // Auto-adjust log level based on NODE_ENV
      const nodeEnv = process.env.NODE_ENV || 'development';
      if (nodeEnv === 'production' && ['debug', 'trace'].includes(val)) {
        return 'info';
      }
      return val;
    }),

  // Rate Limiting
  RATE_LIMIT_WINDOW_SECONDS: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('60')
    .pipe(z.number().int().positive().max(3600)), // Max 1 hour

  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('1')
    .pipe(z.number().int().positive().max(1000)), // Max 1000 requests

  // Database Connection Pool
  DB_POOL_MAX: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional()
    .pipe(z.number().int().positive().max(100).optional()),

  DB_POOL_MIN: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional()
    .pipe(z.number().int().positive().max(50).optional()),

  // CORS
  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function loadEnv(): Env {
  if (env) {
    return env;
  }

  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Invalid environment variables:\n${missingVars}`);
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!env) {
    return loadEnv();
  }
  return env;
}
