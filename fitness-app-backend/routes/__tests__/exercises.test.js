const request = require('supertest');
const express = require('express');
const exercisesRouter = require('../exercises');
const { authenticateToken } = require('../authMiddleware');

// Mock dependencies
jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/cache');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/exercises', exercisesRouter);

describe('Exercises Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/exercises', () => {
    it('should return paginated exercises', async () => {
      const response = await request(app)
        .get('/api/exercises?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    it('should require authentication', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        return res.status(401).json({ error: 'No autenticado' });
      });

      await request(app)
        .get('/api/exercises')
        .expect(401);
    });
  });
});

