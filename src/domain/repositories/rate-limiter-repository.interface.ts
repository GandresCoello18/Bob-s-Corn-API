export interface IRateLimiterRepository {
  /**
   * Checks if a client (identified by key) has exceeded the rate limit
   * @param key - Unique identifier for the client (e.g., IP address)
   * @param windowSeconds - Time window in seconds
   * @param maxRequests - Maximum number of requests allowed in the window
   * @returns true if rate limit is exceeded, false otherwise
   */
  isRateLimited(key: string, windowSeconds: number, maxRequests: number): Promise<boolean>;

  /**
   * Records a request for rate limiting purposes
   * @param key - Unique identifier for the client
   * @param windowSeconds - Time window in seconds
   */
  recordRequest(key: string, windowSeconds: number): Promise<void>;
}
