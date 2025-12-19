const request = require('supertest');
const express = require('express');
const checkinsRouter = require('../checkins');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/checkin', checkinsRouter);

describe('Checkins Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/checkin', () => {
    it('should get check-ins', async () => {
      const response = await request(app)
        .get('/api/checkin')
        .expect(200);

      expect(response.body).toHaveProperty('checkIns');
    });
  });

  describe('POST /api/checkin', () => {
    it('should create check-in', async () => {
      const checkInData = {
        weight: 70.5,
        notes: 'Feeling good',
      };

      const response = await request(app)
        .post('/api/checkin')
        .send(checkInData)
        .expect(201);

      expect(response.body).toHaveProperty('checkIn');
    });
  });
});

