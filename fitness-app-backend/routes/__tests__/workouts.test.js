const request = require('supertest');
const express = require('express');
const workoutsRouter = require('../workouts');
const { authenticateToken } = require('../authMiddleware');

jest.mock('../authMiddleware');
jest.mock('../db/db_config');
jest.mock('../utils/logger');

const app = express();
app.use(express.json());
app.use('/api/workouts', workoutsRouter);

describe('Workouts Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
  });

  describe('GET /api/workouts', () => {
    it('should return paginated workouts', async () => {
      const response = await request(app)
        .get('/api/workouts?page=1&limit=20')
        .expect(200);

      expect(response.body).toHaveProperty('workouts');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/workouts?start_date=2024-01-01&end_date=2024-01-31')
        .expect(200);

      expect(response.body).toHaveProperty('workouts');
    });
  });

  describe('POST /api/workouts/log', () => {
    it('should log a workout', async () => {
      const workoutData = {
        exercise_id: 1,
        sets_done: 3,
        reps_done: 10,
        burned_calories: 100,
      };

      const response = await request(app)
        .post('/api/workouts/log')
        .send(workoutData)
        .expect(201);

      expect(response.body).toHaveProperty('dailyExercise');
    });

    it('should require exercise_id, sets_done, and burned_calories', async () => {
      await request(app)
        .post('/api/workouts/log')
        .send({ exercise_id: 1 })
        .expect(400);
    });
  });
});

