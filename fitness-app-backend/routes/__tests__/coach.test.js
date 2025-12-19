const request = require('supertest');
const express = require('express');
const coachRouter = require('../coach');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');
jest.mock('nodemailer');

const app = express();
app.use(express.json());
app.use('/api/coach', coachRouter);

describe('Coach Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1, role: 'COACH' };
      next();
    });
  });

  describe('GET /api/coach/clients', () => {
    it('should return paginated clients', async () => {
      const response = await request(app)
        .get('/api/coach/clients?page=1&limit=20')
        .expect(200);

      expect(response.body).toHaveProperty('clients');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/coach/invite', () => {
    it('should create invite token', async () => {
      const response = await request(app)
        .post('/api/coach/invite')
        .send({ email: 'client@example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('inviteLink');
    });
  });
});

