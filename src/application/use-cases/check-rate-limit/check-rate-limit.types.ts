export interface CheckRateLimitInput {
  clientIp: string;
  windowSeconds: number;
  maxRequests: number;
}
