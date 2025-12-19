const request = require('supertest');
const express = require('express');
const calendarRouter = require('../calendar');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/calendar', calendarRouter);

describe('Calendar Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/calendar', () => {
    it('should get calendar events', async () => {
      const response = await request(app)
        .get('/api/calendar')
        .expect(200);

      expect(response.body).toHaveProperty('events');
    });
  });

  describe('POST /api/calendar', () => {
    it('should create calendar event', async () => {
      const eventData = {
        routine_id: 1,
        scheduled_date: '2024-01-01',
      };

      const response = await request(app)
        .post('/api/calendar')
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('event');
    });
  });
});
