const request = require('supertest');
const express = require('express');
const adminRoutes = require('../admin');
const { db } = require('../../db/db_config');

// Mock de la base de datos
jest.mock('../../db/db_config', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([])),
          limit: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ user_id: 1, email: 'test@test.com', role: 'CLIENT' }])),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([{ user_id: 1, email: 'test@test.com' }])),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => Promise.resolve([])),
    })),
  },
}));

// Mock de logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

// Mock de authenticateToken
const mockAuthenticateToken = (req, res, next) => {
  req.user = {
    id: 1,
    email: 'admin@test.com',
    isAdmin: true,
  };
  next();
};

jest.mock('../authMiddleware', () => mockAuthenticateToken);

// Mock de rate limiter
const mockRateLimiter = (req, res, next) => next();

jest.mock('../../middleware/rateLimiter', () => ({
  adminLimiter: mockRateLimiter,
}));

// Mock de sql para count
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ type: 'eq', a, b })),
  and: jest.fn((...args) => ({ type: 'and', args })),
  gte: jest.fn((a, b) => ({ type: 'gte', a, b })),
  lte: jest.fn((a, b) => ({ type: 'lte', a, b })),
  asc: jest.fn((a) => ({ type: 'asc', a })),
  desc: jest.fn((a) => ({ type: 'desc', a })),
  sql: jest.fn((strings, ...values) => ({
    type: 'sql',
    strings,
    values,
  })),
}));

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin Routes - /admin/metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe obtener métricas del sistema', async () => {
    // Mock de datos de usuarios
    db.select.mockReturnValueOnce({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([
            { user_id: 1, email: 'user1@test.com', role: 'CLIENT', created_at: new Date(), onboarding_completed: true },
            { user_id: 2, email: 'coach@test.com', role: 'COACH', created_at: new Date(), onboarding_completed: false },
          ])),
        })),
      })),
    });

    // Mock de dailyLogs
    db.select.mockReturnValueOnce({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([
            { date: '2024-01-15', user_id: 1, consumed_calories: '2000', burned_calories: '500' },
          ])),
        })),
      })),
    });

    // Mock de dailyExercises
    db.select.mockReturnValueOnce({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() => ({
          innerJoin: jest.fn(() => ({
            where: jest.fn(() => ({
              orderBy: jest.fn(() => Promise.resolve([
                { date: '2024-01-15', burned_calories: '500' },
              ])),
            })),
          })),
        })),
      })),
    });

    // Mock de mealItems
    db.select.mockReturnValueOnce({
      from: jest.fn(() => ({
        innerJoin: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => Promise.resolve([
              { date: '2024-01-15' },
            ])),
          })),
        })),
      })),
    });

    // Mock de count para routines
    db.select.mockReturnValueOnce({
      from: jest.fn(() => Promise.resolve([{ count: '5' }])),
    });

    // Mock de count para active routines
    db.select.mockReturnValueOnce({
      from: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve([{ count: '3' }])),
      })),
    });

    // Mock de count para exercises
    db.select.mockReturnValueOnce({
      from: jest.fn(() => Promise.resolve([{ count: '100' }])),
    });

    // Mock de count para foods
    db.select.mockReturnValueOnce({
      from: jest.fn(() => Promise.resolve([{ count: '200' }])),
    });

    const response = await request(app)
      .get('/admin/metrics?period=month')
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('activity');
    expect(response.body).toHaveProperty('routines');
    expect(response.body).toHaveProperty('charts');
  });

  it('debe manejar errores correctamente', async () => {
    db.select.mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/admin/metrics?period=month')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });
});

describe('Admin Routes - /admin/users', () => {
  it('debe listar usuarios', async () => {
    db.select.mockReturnValueOnce({
      from: jest.fn(() => ({
        orderBy: jest.fn(() => Promise.resolve([
          { id: 1, email: 'user1@test.com', role: 'CLIENT', createdAt: new Date() },
        ])),
      })),
    });

    const response = await request(app)
      .get('/admin/users')
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});








