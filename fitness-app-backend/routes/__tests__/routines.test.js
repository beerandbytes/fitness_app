const request = require('supertest');
const express = require('express');
const routinesRoutes = require('../routines');
const authenticateToken = require('../authMiddleware');

// Mock del middleware de autenticación
jest.mock('../authMiddleware', () => (req, res, next) => {
  req.user = { id: 1 };
  next();
});

// Mock de la base de datos
jest.mock('../../db/db_config', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock de logger
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

const { db } = require('../../db/db_config');
const app = express();
app.use(express.json());
app.use('/routines', routinesRoutes);

describe('Routines Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /routines', () => {
    it('debe listar rutinas del usuario con paginación', async () => {
      jest.clearAllMocks();
      
      // Mock: contar total
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([{ count: '5' }]),
        }),
      });

      // Mock: obtener rutinas
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            orderBy: jest.fn().mockReturnValueOnce({
              limit: jest.fn().mockReturnValueOnce({
                offset: jest.fn().mockResolvedValueOnce([
                  { routine_id: 1, name: 'Rutina 1' },
                  { routine_id: 2, name: 'Rutina 2' },
                ]),
              }),
            }),
          }),
        }),
      });

      const response = await request(app)
        .get('/routines?page=1&limit=20');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('routines');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 20);
    });
  });

  describe('POST /routines', () => {
    it('debe crear una nueva rutina', async () => {
      jest.clearAllMocks();
      db.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([{
            routine_id: 1,
            name: 'Nueva Rutina',
            description: 'Descripción',
            user_id: 1,
            is_active: true,
            created_at: new Date(),
          }]),
        }),
      });

      const response = await request(app)
        .post('/routines')
        .send({
          name: 'Nueva Rutina',
          description: 'Descripción',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('routine');
      expect(response.body.routine.name).toBe('Nueva Rutina');
    });

    it('debe validar que el nombre sea requerido', async () => {
      const response = await request(app)
        .post('/routines')
        .send({
          description: 'Sin nombre',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /routines/from-template', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('debe crear una rutina desde una plantilla válida', async () => {
      const mockTemplate = {
        template_id: 1,
        coach_id: 1,
        name: 'Rutina de Prueba',
        description: 'Descripción de prueba',
        exercises: {
          exercises: [
            {
              exercise_id: 1,
              exercise_name: 'Push-ups',
              sets: 3,
              reps: 10,
              weight_kg: 0,
              duration_minutes: null,
              order_index: 1,
              day_of_week: 1,
            },
            {
              exercise_id: 2,
              exercise_name: 'Squats',
              sets: 3,
              reps: 15,
              weight_kg: 0,
              duration_minutes: null,
              order_index: 2,
              day_of_week: 1,
            },
          ],
        },
      };

      const mockExercise1 = { exercise_id: 1, name: 'Push-ups', name_es: 'Flexiones' };
      const mockExercise2 = { exercise_id: 2, name: 'Squats', name_es: 'Sentadillas' };

      // Mock: obtener plantilla
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([mockTemplate]),
          }),
        }),
      });

      // Mock: crear rutina
      const mockNewRoutine = {
        routine_id: 10,
        user_id: 1,
        name: 'Rutina de Prueba',
        description: 'Descripción de prueba',
        is_active: true,
      };

      db.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockNewRoutine]),
        }),
      });

      // Mock: verificar ejercicio 1 existe
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([mockExercise1]),
          }),
        }),
      });

      // Mock: verificar ejercicio 2 existe
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([mockExercise2]),
          }),
        }),
      });

      // Mock: insertar ejercicios
      db.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValueOnce([]),
      });

      // Mock: obtener rutina completa con ejercicios
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          leftJoin: jest.fn().mockReturnValueOnce({
            leftJoin: jest.fn().mockReturnValueOnce({
              where: jest.fn().mockReturnValueOnce({
                orderBy: jest.fn().mockResolvedValueOnce([
                  {
                    routineId: 10,
                    routineName: 'Rutina de Prueba',
                    routineDescription: 'Descripción de prueba',
                    routineIsActive: true,
                    routineExerciseId: 1,
                    exerciseId: 1,
                    exerciseName: 'Push-ups',
                    exerciseNameEs: 'Flexiones',
                    exerciseCategory: 'Strength',
                    sets: 3,
                    reps: 10,
                    durationMinutes: null,
                    weightKg: 0,
                    orderIndex: 1,
                    dayOfWeek: 1,
                  },
                  {
                    routineId: 10,
                    routineName: 'Rutina de Prueba',
                    routineDescription: 'Descripción de prueba',
                    routineIsActive: true,
                    routineExerciseId: 2,
                    exerciseId: 2,
                    exerciseName: 'Squats',
                    exerciseNameEs: 'Sentadillas',
                    exerciseCategory: 'Strength',
                    sets: 3,
                    reps: 15,
                    durationMinutes: null,
                    weightKg: 0,
                    orderIndex: 2,
                    dayOfWeek: 1,
                  },
                ]),
              }),
            }),
          }),
        }),
      });

      // Mock: insertar rutinas programadas (4 semanas x 1 día = 4 inserciones)
      // Como el día de la semana es 1 (lunes), se planificará para 4 lunes
      // Agregar mocks para cada inserción de fecha programada
      for (let i = 0; i < 4; i++) {
        db.insert.mockReturnValueOnce({
          values: jest.fn().mockReturnValueOnce({
            onConflictDoUpdate: jest.fn().mockResolvedValueOnce([]),
          }),
        });
      }

      const response = await request(app)
        .post('/routines/from-template')
        .send({
          template_id: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('routine');
      expect(response.body.routine.name).toBe('Rutina de Prueba');
      expect(response.body.routine.exercises).toHaveLength(2);
      expect(response.body.message).toContain('Rutina creada con éxito');
      
      // Verificar que se intentó programar la rutina automáticamente
      // Debería haber al menos una llamada a insert para scheduledRoutines (4 semanas)
      expect(db.insert).toHaveBeenCalled();
    });

    it('debe retornar 404 si la plantilla no existe', async () => {
      // Mock: plantilla no encontrada
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      const response = await request(app)
        .post('/routines/from-template')
        .send({
          template_id: 999,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Plantilla no encontrada');
    });

    it('debe retornar 400 si falta template_id', async () => {
      const response = await request(app)
        .post('/routines/from-template')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('template_id es obligatorio');
    });

    it('debe retornar 400 si la plantilla no tiene ejercicios', async () => {
      const mockTemplateWithoutExercises = {
        template_id: 1,
        coach_id: 1,
        name: 'Rutina Sin Ejercicios',
        description: 'Descripción',
        exercises: null,
      };

      // Mock: obtener plantilla sin ejercicios
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([mockTemplateWithoutExercises]),
          }),
        }),
      });

      const response = await request(app)
        .post('/routines/from-template')
        .send({
          template_id: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('no tiene ejercicios');
    });

    it('debe omitir ejercicios inválidos y crear rutina con los válidos', async () => {
      const mockTemplate = {
        template_id: 1,
        coach_id: 1,
        name: 'Rutina con Ejercicios Inválidos',
        description: 'Descripción',
        exercises: {
          exercises: [
            {
              exercise_id: 1,
              exercise_name: 'Ejercicio Válido',
              sets: 3,
              reps: 10,
              order_index: 1,
              day_of_week: 1,
            },
            {
              exercise_id: 999, // ID inválido
              exercise_name: 'Ejercicio Inválido',
              sets: 3,
              reps: 10,
              order_index: 2,
              day_of_week: 1,
            },
          ],
        },
      };

      const mockValidExercise = { exercise_id: 1, name: 'Ejercicio Válido' };

      // Mock: obtener plantilla
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([mockTemplate]),
          }),
        }),
      });

      // Mock: crear rutina
      const mockNewRoutine = {
        routine_id: 11,
        user_id: 1,
        name: 'Rutina con Ejercicios Inválidos',
        is_active: true,
      };

      db.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockNewRoutine]),
        }),
      });

      // Mock: verificar ejercicio válido existe
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([mockValidExercise]),
          }),
        }),
      });

      // Mock: verificar ejercicio inválido no existe
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      // Mock: insertar ejercicios válidos
      db.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValueOnce([]),
      });

      // Mock: obtener rutina completa
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          leftJoin: jest.fn().mockReturnValueOnce({
            leftJoin: jest.fn().mockReturnValueOnce({
              where: jest.fn().mockReturnValueOnce({
                orderBy: jest.fn().mockResolvedValueOnce([
                  {
                    routineId: 11,
                    routineName: 'Rutina con Ejercicios Inválidos',
                    routineDescription: 'Descripción',
                    routineIsActive: true,
                    routineExerciseId: 1,
                    exerciseId: 1,
                    exerciseName: 'Ejercicio Válido',
                    exerciseCategory: 'Strength',
                    sets: 3,
                    reps: 10,
                    durationMinutes: null,
                    weightKg: 0,
                    orderIndex: 1,
                    dayOfWeek: 1,
                  },
                ]),
              }),
            }),
          }),
        }),
      });

      // Mock: insertar rutinas programadas (4 semanas x 1 día = 4 inserciones)
      for (let i = 0; i < 4; i++) {
        db.insert.mockReturnValueOnce({
          values: jest.fn().mockReturnValueOnce({
            onConflictDoUpdate: jest.fn().mockResolvedValueOnce([]),
          }),
        });
      }

      const response = await request(app)
        .post('/routines/from-template')
        .send({
          template_id: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.routine.exercises).toHaveLength(1);
      expect(response.body.warnings).toHaveProperty('skipped_exercises');
      expect(response.body.warnings.skipped_exercises).toHaveLength(1);
      expect(response.body.message).toContain('omitido');
    });

    it('debe crear rutina con parámetros de planificación personalizados', async () => {
      const mockTemplate = {
        template_id: 1,
        coach_id: 1,
        name: 'Rutina Personalizada',
        description: 'Descripción',
        exercises: {
          exercises: [
            {
              exercise_id: 1,
              exercise_name: 'Push-ups',
              sets: 3,
              reps: 10,
              day_of_week: 1,
            },
          ],
        },
      };

      const mockExercise1 = { exercise_id: 1, name: 'Push-ups', name_es: 'Flexiones' };

      // Mock: obtener plantilla
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([mockTemplate]),
          }),
        }),
      });

      // Mock: crear rutina
      const mockNewRoutine = {
        routine_id: 12,
        user_id: 1,
        name: 'Rutina Personalizada',
        is_active: true,
      };

      db.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockNewRoutine]),
        }),
      });

      // Mock: verificar ejercicio existe
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([mockExercise1]),
          }),
        }),
      });

      // Mock: insertar ejercicios
      db.insert.mockReturnValueOnce({
        values: jest.fn().mockResolvedValueOnce([]),
      });

      // Mock: obtener rutina completa
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          leftJoin: jest.fn().mockReturnValueOnce({
            leftJoin: jest.fn().mockReturnValueOnce({
              where: jest.fn().mockReturnValueOnce({
                orderBy: jest.fn().mockResolvedValueOnce([
                  {
                    routineId: 12,
                    routineName: 'Rutina Personalizada',
                    routineDescription: 'Descripción',
                    routineIsActive: true,
                    routineExerciseId: 1,
                    exerciseId: 1,
                    exerciseName: 'Push-ups',
                    exerciseNameEs: 'Flexiones',
                    exerciseCategory: 'Strength',
                    sets: 3,
                    reps: 10,
                    durationMinutes: null,
                    weightKg: 0,
                    orderIndex: 1,
                    dayOfWeek: 1,
                  },
                ]),
              }),
            }),
          }),
        }),
      });

      // Mock: insertar rutinas programadas (2 semanas x 2 días = 4 inserciones)
      for (let i = 0; i < 4; i++) {
        db.insert.mockReturnValueOnce({
          values: jest.fn().mockReturnValueOnce({
            onConflictDoUpdate: jest.fn().mockResolvedValueOnce([]),
          }),
        });
      }

      const response = await request(app)
        .post('/routines/from-template')
        .send({
          template_id: 1,
          schedule_weeks: 2,
          schedule_days_of_week: [1, 3], // Lunes y Miércoles
          schedule_start_date: '2024-01-01'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('routine');
      expect(response.body.routine.name).toBe('Rutina Personalizada');
    });

    it('debe validar parámetros de planificación inválidos', async () => {
      // Test semanas inválidas
      const response1 = await request(app)
        .post('/routines/from-template')
        .send({
          template_id: 1,
          schedule_weeks: 15 // Más de 12
        });

      expect(response1.status).toBe(400);
      expect(response1.body.error).toContain('schedule_weeks');

      // Test días de semana inválidos
      const response2 = await request(app)
        .post('/routines/from-template')
        .send({
          template_id: 1,
          schedule_days_of_week: 'invalid' // No es array
        });

      expect(response2.status).toBe(400);
      expect(response2.body.error).toContain('schedule_days_of_week');

      // Test fecha inválida
      const response3 = await request(app)
        .post('/routines/from-template')
        .send({
          template_id: 1,
          schedule_start_date: 'invalid-date'
        });

      expect(response3.status).toBe(400);
      expect(response3.body.error).toContain('schedule_start_date');
    });
  });
});

