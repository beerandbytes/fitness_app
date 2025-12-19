const request = require('supertest');
const express = require('express');
const clientRouter = require('../client');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/client', clientRouter);

describe('Client Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/client/profile', () => {
    it('should get client profile', async () => {
      const response = await request(app)
        .get('/api/client/profile')
        .expect(200);

      expect(response.body).toHaveProperty('profile');
    });
  });
});

