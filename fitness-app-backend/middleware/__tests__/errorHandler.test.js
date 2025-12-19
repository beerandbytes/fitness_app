const errorHandler = require('../errorHandler');
const logger = require('../../utils/logger');

jest.mock('../../utils/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle validation errors', () => {
    const error = {
      name: 'ValidationError',
      message: 'Validation failed',
      details: [{ field: 'email', message: 'Invalid email' }],
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
      })
    );
  });

  it('should handle unauthorized errors', () => {
    const error = {
      name: 'UnauthorizedError',
      message: 'Unauthorized',
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should handle not found errors', () => {
    const error = {
      name: 'NotFoundError',
      message: 'Resource not found',
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should handle generic errors', () => {
    const error = new Error('Generic error');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(logger.error).toHaveBeenCalled();
  });
});

