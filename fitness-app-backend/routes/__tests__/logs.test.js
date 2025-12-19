const request = require('supertest');
const express = require('express');
const logsRouter = require('../logs');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/logs', logsRouter);

describe('Logs Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/logs/:date', () => {
    it('should get daily log', async () => {
      const response = await request(app)
        .get('/api/logs/2024-01-01')
        .expect(200);

      expect(response.body).toHaveProperty('log');
    });
  });

  describe('POST /api/logs', () => {
    it('should create or update log', async () => {
      const logData = {
        date: '2024-01-01',
        weight: 70.5,
      };

      const response = await request(app)
        .post('/api/logs')
        .send(logData)
        .expect(201);

      expect(response.body).toHaveProperty('log');
    });
  });
});

