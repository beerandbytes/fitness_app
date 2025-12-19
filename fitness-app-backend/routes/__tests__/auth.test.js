const request = require('supertest');
const express = require('express');
const authRoutes = require('../auth');
const { db } = require('../../db/db_config');

// Mock de la base de datos - Drizzle ORM usa métodos encadenables
// where() puede devolver directamente una promesa O un objeto con limit()
jest.mock('../../db/db_config', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(),
      })),
    })),
  },
}));


// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock de jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_jwt_token'),
}));

// Mock de passwordValidator
jest.mock('../../utils/passwordValidator', () => ({
  validatePasswordStrength: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  formatPasswordErrors: jest.fn().mockReturnValue('Error de contraseña'),
}));

// Mock de logger - mostrar errores en tests para debugging
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn((msg, data) => {
    // Mostrar errores en consola durante tests para debugging
    if (data && data.error) {
      console.error('Logger Error:', msg, 'Message:', data.error.message || data.error, 'Stack:', data.error.stack || data.stack);
    } else {
      console.error('Logger Error:', msg, data);
    }
  }),
  debug: jest.fn(),
}));

// Mock de middleware de validación
jest.mock('../../middleware/validation', () => ({
  routeValidations: {
    register: (req, res, next) => next(), // Pasa la validación
    login: (req, res, next) => next(), // Pasa la validación
    forgotPassword: (req, res, next) => next(), // Pasa la validación
    resetPassword: (req, res, next) => next(), // Pasa la validación
  },
  handleValidationErrors: (req, res, next) => next(), // No hay errores de validación
}));


const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Helper para crear un mock thenable (promesa) con método limit()
// where() puede ser usado directamente con await O con .limit()
function createThenableWithLimit(value) {
  const promise = Promise.resolve(value);
  // Crear un objeto que sea thenable (pueda ser usado con await)
  const thenable = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
    limit: jest.fn(() => promise),
  };
  // Hacer que el objeto sea reconocido como promesa
  Object.setPrototypeOf(thenable, Promise.prototype);
  return thenable;
}

describe('Auth Routes', () => {
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');
  const { validatePasswordStrength } = require('../../utils/passwordValidator');

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_EMAILS = ''; // No hay admins en los tests
    // Resetear mocks por defecto
    bcrypt.hash.mockResolvedValue('hashed_password');
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock_jwt_token');
    validatePasswordStrength.mockReturnValue({ valid: true, errors: [] });
  });

  describe('POST /auth/register', () => {
    it('debe registrar un nuevo usuario correctamente', async () => {
      // Mock: usuario no existe (select devuelve array vacío)
      // where() debe devolver una promesa directamente (thenable)
      const whereResult = createThenableWithLimit([]);
      const whereMock = jest.fn(() => whereResult);
      db.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: whereMock,
        })),
      });

      // Mock: inserción exitosa
      const returningMock = jest.fn().mockResolvedValue([{
        id: 1,
        email: 'test@example.com',
        role: 'CLIENT',
      }]);
      db.insert.mockReturnValueOnce({
        values: jest.fn(() => ({
          returning: returningMock,
        })),
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      // Debug temporal
      if (response.status !== 201) {
        console.log('=== DEBUG TEST ===');
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(response.body, null, 2));
        console.log('==================');
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('debe rechazar registro con email existente', async () => {
      jest.clearAllMocks();
      // Mock: usuario ya existe (select devuelve array con usuario)
      const userData = [{
        user_id: 1,
        email: 'test@example.com',
      }];
      const whereMock = jest.fn(() => createThenableWithLimit(userData));
      db.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: whereMock,
        })),
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('debe validar fortaleza de contraseña', async () => {
      // Mock: validación de contraseña falla
      validatePasswordStrength.mockReturnValueOnce({ 
        valid: false, 
        errors: ['La contraseña debe tener al menos 8 caracteres'] 
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    it('debe hacer login correctamente con credenciales válidas', async () => {
      jest.clearAllMocks();
      // Configurar mocks
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mock_access_token');
      jwt.sign.mockReturnValueOnce('mock_refresh_token');
      
      // Mock: usuario encontrado
      // Para login, where() devuelve un objeto con limit() que devuelve la promesa
      const userData = [{
        user_id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_Password123',
        role: 'CLIENT',
        is_admin: false,
        onboarding_completed: false,
        onboarding_step: 0,
      }];
      const promise = Promise.resolve(userData);
      const limitMock = jest.fn(() => promise);
      const whereMock = jest.fn(() => ({
        limit: limitMock,
      }));
      db.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: whereMock,
        })),
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('debe rechazar login con credenciales inválidas', async () => {
      jest.clearAllMocks();
      // Mock: usuario no encontrado (array vacío)
      // Para login, where() devuelve un objeto con limit() que devuelve la promesa
      const promise = Promise.resolve([]);
      const limitMock = jest.fn(() => promise);
      const whereMock = jest.fn(() => ({
        limit: limitMock,
      }));
      db.select.mockReturnValueOnce({
        from: jest.fn(() => ({
          where: whereMock,
        })),
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});

