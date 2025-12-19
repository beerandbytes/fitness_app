const request = require('supertest');
const express = require('express');
const mealItemsRouter = require('../mealItems');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/meal-items', mealItemsRouter);

describe('MealItems Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('POST /api/meal-items', () => {
    it('should create meal item', async () => {
      const mealItemData = {
        log_id: 1,
        food_id: 1,
        quantity_grams: 100,
        meal_type: 'Desayuno',
      };

      const response = await request(app)
        .post('/api/meal-items')
        .send(mealItemData)
        .expect(201);

      expect(response.body).toHaveProperty('mealItem');
    });

    it('should require authentication', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        return res.status(401).json({ error: 'No autenticado' });
      });

      await request(app)
        .post('/api/meal-items')
        .send({ food_id: 1, quantity_grams: 100 })
        .expect(401);
    });
  });

  describe('DELETE /api/meal-items/:id', () => {
    it('should delete meal item', async () => {
      const response = await request(app)
        .delete('/api/meal-items/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});

