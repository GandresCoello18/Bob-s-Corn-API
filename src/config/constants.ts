export const RATE_LIMIT = {
  DEFAULT_WINDOW_SECONDS: 60,
  DEFAULT_MAX_REQUESTS: 1,
  REDIS_KEY_PREFIX: 'rate_limit:purchase:',
} as const;

export const HTTP = {
  DEFAULT_PORT: 3000,
  DEFAULT_HOST: '0.0.0.0',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  BODY_LIMIT: 1048576, // 1MB
} as const;

export const DATABASE = {
  POOL: {
    MAX_CONNECTIONS: 20,
    MIN_CONNECTIONS: 5,
    IDLE_TIMEOUT: 30000, // 30 seconds
    CONNECTION_TIMEOUT: 10000, // 10 seconds
  },
} as const;

export const REDIS = {
  RETRY_DELAY: 50,
  MAX_RETRY_DELAY: 2000,
  MAX_RETRIES_PER_REQUEST: 3,
  KEY_EXPIRY_BUFFER_SECONDS: 10,
} as const;

export const UNKNOWN_CLIENT_IP = 'unknown';
