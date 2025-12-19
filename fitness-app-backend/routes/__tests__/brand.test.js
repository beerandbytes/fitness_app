const request = require('supertest');
const express = require('express');
const brandRouter = require('../brand');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/brand', brandRouter);

describe('Brand Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1, role: 'ADMIN' };
      next();
    });
  });

  describe('GET /api/brand', () => {
    it('should get brand settings', async () => {
      const response = await request(app)
        .get('/api/brand')
        .expect(200);

      expect(response.body).toHaveProperty('brand');
    });
  });

  describe('PUT /api/brand', () => {
    it('should update brand settings', async () => {
      const brandData = {
        name: 'Test Brand',
        primary_color: '#000000',
      };

      const response = await request(app)
        .put('/api/brand')
        .send(brandData)
        .expect(200);

      expect(response.body).toHaveProperty('brand');
    });
  });
});

