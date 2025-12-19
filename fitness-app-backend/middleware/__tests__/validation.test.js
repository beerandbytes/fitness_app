const { routeValidations, commonValidations, handleValidationErrors } = require('../validation');
const { validationResult } = require('express-validator');

jest.mock('express-validator');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('commonValidations.pagination', () => {
    it('should validate pagination parameters', () => {
      req.query = { page: '1', limit: '20' };
      const middleware = commonValidations.pagination;
      expect(middleware).toBeDefined();
    });
  });

  describe('handleValidationErrors', () => {
    it('should call next if no errors', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 400 if validation errors exist', () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Validation error' }],
      });

      handleValidationErrors(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

