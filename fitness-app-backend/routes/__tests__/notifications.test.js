const request = require('supertest');
const express = require('express');
const notificationsRouter = require('../notifications');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationsRouter);

describe('Notifications Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/notifications', () => {
    it('should return paginated notifications', async () => {
      const response = await request(app)
        .get('/api/notifications?page=1&limit=20')
        .expect(200);

      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('unreadCount');
    });

    it('should filter unread notifications', async () => {
      const response = await request(app)
        .get('/api/notifications?unread=true')
        .expect(200);

      expect(response.body).toHaveProperty('notifications');
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const response = await request(app)
        .put('/api/notifications/1/read')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});

