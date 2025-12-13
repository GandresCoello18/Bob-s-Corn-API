import pino from 'pino';

import { getEnv } from '@config/env';

export function createLogger() {
  const env = getEnv();

  const logger = pino({
    level: env.LOG_LEVEL,
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });

  return logger;
}

export type Logger = ReturnType<typeof createLogger>;
