export const createMockLogger = () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
});

export const createMockPrismaClient = () => {
  const mockPurchase = {
    create: jest.fn() as jest.MockedFunction<any>,
    findMany: jest.fn() as jest.MockedFunction<any>,
    count: jest.fn() as jest.MockedFunction<any>,
    findUnique: jest.fn() as jest.MockedFunction<any>,
    update: jest.fn() as jest.MockedFunction<any>,
    delete: jest.fn() as jest.MockedFunction<any>,
  };

  return {
    purchase: mockPurchase,
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  } as any;
};

export const createMockRateLimiterRepository = () => ({
  isRateLimited: jest.fn(),
  recordRequest: jest.fn(),
});

export const createMockDatabaseRepository = () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  healthCheck: jest.fn(),
  getClient: jest.fn(),
});

export const createMockCacheRepository = () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  healthCheck: jest.fn(),
  getClient: jest.fn(),
});
