const request = require('supertest');
const express = require('express');
const foodsRouter = require('../foods');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/cache');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/foods', foodsRouter);

describe('Foods Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/foods/search', () => {
    it('should search foods with pagination', async () => {
      const response = await request(app)
        .get('/api/foods/search?name=pollo&page=1&limit=20')
        .expect(200);

      expect(response.body).toHaveProperty('foods');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should require minimum 2 characters for search', async () => {
      await request(app)
        .get('/api/foods/search?name=p')
        .expect(400);
    });
  });

  describe('POST /api/foods', () => {
    beforeEach(() => {
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: 1 };
        next();
      });
    });

    it('should create new food', async () => {
      const foodData = {
        name: 'Test Food',
        calories_base: 100,
        protein_g: 10,
        carbs_g: 20,
        fat_g: 5,
      };

      const response = await request(app)
        .post('/api/foods')
        .send(foodData)
        .expect(201);

      expect(response.body).toHaveProperty('food');
    });

    it('should require authentication', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        return res.status(401).json({ error: 'No autenticado' });
      });

      await request(app)
        .post('/api/foods')
        .send({ name: 'Test', calories_base: 100 })
        .expect(401);
    });
  });
});

