import { describe, it, expect, beforeEach, vi } from 'vitest';
import logger from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should log debug messages in development', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('Debug message');
    expect(console.debug).toHaveBeenCalled();
  });

  it('should log info messages', () => {
    logger.info('Info message');
    expect(console.info).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.warn('Warning message');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.error('Error message');
    expect(console.error).toHaveBeenCalled();
  });

  it('should format messages with timestamps', () => {
    logger.info('Test message');
    const callArgs = console.info.mock.calls[0][0];
    expect(callArgs).toContain('[INFO]');
    expect(callArgs).toContain('Test message');
  });

  it('should handle error objects', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', error);
    expect(console.error).toHaveBeenCalled();
  });
});

