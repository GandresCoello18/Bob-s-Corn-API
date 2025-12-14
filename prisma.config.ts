import { resolve } from 'path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

function getEnvFilePath(): string {
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  const envFile = appEnv === 'production' ? '.env.prod' : '.env.dev';
  return resolve(process.cwd(), envFile);
}

const envFilePath = getEnvFilePath();
config({ path: envFilePath });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
