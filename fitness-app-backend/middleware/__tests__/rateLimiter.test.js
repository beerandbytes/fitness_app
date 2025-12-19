const { generalLimiter, createLimiter, coachLimiter } = require('../rateLimiter');

describe('Rate Limiter Middleware', () => {
  it('should export generalLimiter', () => {
    expect(generalLimiter).toBeDefined();
  });

  it('should export createLimiter function', () => {
    expect(createLimiter).toBeDefined();
    expect(typeof createLimiter).toBe('function');
  });

  it('should export coachLimiter', () => {
    expect(coachLimiter).toBeDefined();
  });

  it('should create custom limiter', () => {
    const customLimiter = createLimiter({
      windowMs: 15 * 60 * 1000,
      max: 100,
    });
    expect(customLimiter).toBeDefined();
  });
});

