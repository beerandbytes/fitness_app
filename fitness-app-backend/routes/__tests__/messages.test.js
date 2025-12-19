const request = require('supertest');
const express = require('express');
const messagesRouter = require('../messages');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/messages', messagesRouter);

describe('Messages Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/messages', () => {
    it('should get messages', async () => {
      const response = await request(app)
        .get('/api/messages')
        .expect(200);

      expect(response.body).toHaveProperty('messages');
    });
  });

  describe('POST /api/messages', () => {
    it('should create message', async () => {
      const messageData = {
        recipient_id: 2,
        content: 'Test message',
      };

      const response = await request(app)
        .post('/api/messages')
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });
  });
});
