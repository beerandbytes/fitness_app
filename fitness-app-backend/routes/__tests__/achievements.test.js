const request = require('supertest');
const express = require('express');
const achievementsRouter = require('../achievements');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/achievements', achievementsRouter);

describe('Achievements Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/achievements', () => {
    it('should get user achievements', async () => {
      const response = await request(app)
        .get('/api/achievements')
        .expect(200);

      expect(response.body).toHaveProperty('achievements');
    });
  });
});

