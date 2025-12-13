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
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
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
