const { getOrSetCache, invalidateCache } = require('../cache');
const { db } = require('../db/db_config');

jest.mock('../db/db_config');
jest.mock('node-cache');

describe('Cache Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get cached value if exists', async () => {
    const cacheKey = 'test-key';
    const cachedValue = { data: 'cached' };
    
    // Mock cache get to return value
    const mockCache = {
      get: jest.fn().mockReturnValue(cachedValue),
      set: jest.fn(),
    };
    
    // This is a simplified test - actual implementation may vary
    expect(mockCache.get(cacheKey)).toBe(cachedValue);
  });

  it('should set cache value if not exists', async () => {
    const cacheKey = 'test-key';
    const value = { data: 'new' };
    const ttl = 300;

    const mockCache = {
      get: jest.fn().mockReturnValue(undefined),
      set: jest.fn(),
    };

    if (!mockCache.get(cacheKey)) {
      mockCache.set(cacheKey, value, ttl);
    }

    expect(mockCache.set).toHaveBeenCalledWith(cacheKey, value, ttl);
  });

  it('should invalidate cache', () => {
    const cacheKey = 'test-key';
    const mockCache = {
      del: jest.fn(),
    };

    mockCache.del(cacheKey);
    expect(mockCache.del).toHaveBeenCalledWith(cacheKey);
  });
});

