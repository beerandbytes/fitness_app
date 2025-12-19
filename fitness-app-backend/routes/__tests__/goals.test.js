const request = require('supertest');
const express = require('express');
const goalsRouter = require('../goals');
const { createMockRequest, createMockResponse, createMockNext } = require('../../tests/helpers/testHelpers');

// Mock de dependencias
jest.mock('../../db/db_config', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../middleware/asyncHandler', () => ({
  asyncHandler: (fn) => fn, // Simplemente devolver la función sin envolver
}));

jest.mock('../../middleware/validation', () => ({
  routeValidations: {
    createGoal: (req, res, next) => next(),
    updateGoal: (req, res, next) => next(),
  },
  handleValidationErrors: (req, res, next) => next(),
}));

jest.mock('../../middleware/authMiddleware', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, email: 'test@example.com' };
    next();
  },
}));

describe('Goals Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/goals', goalsRouter);
  });

  describe('GET /api/goals', () => {
    it.skip('debe retornar el objetivo activo del usuario', async () => {
      // Mock de datos
      const mockGoal = {
        goal_id: 1,
        user_id: 1,
        target_weight: 70,
        current_weight: 75,
        daily_calorie_goal: 2000,
        goal_type: 'weight_loss',
        is_active: true,
      };

      // Test pendiente de implementación completa
      // Requiere mock de db y authenticateToken
    });
  });

  describe('POST /api/goals', () => {
    it.skip('debe crear un nuevo objetivo con datos válidos', async () => {
      const goalData = {
        target_weight: 70,
        current_weight: 75,
        weekly_weight_change_goal: -0.5,
        goal_type: 'weight_loss',
      };

      // Test pendiente de implementación completa
      // Requiere mock de db y authenticateToken
    });

    it.skip('debe rechazar datos inválidos', async () => {
      const invalidData = {
        target_weight: 10, // Muy bajo
        current_weight: 75,
      };

      // Test pendiente de implementación completa
      // Requiere validación con express-validator
    });
  });
});

