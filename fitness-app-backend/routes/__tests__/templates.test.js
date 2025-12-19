const request = require('supertest');
const express = require('express');

// Mock antes de importar el router
jest.mock('../authMiddleware', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 1, role: 'COACH' };
    next();
  })
}));

jest.mock('../db/db_config', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    execute: jest.fn()
  }
}));

jest.mock('../db/schema', () => ({
  users: { user_id: 'user_id', email: 'email', role: 'role' },
  routineTemplates: { 
    template_id: 'template_id', 
    coach_id: 'coach_id', 
    name: 'name',
    description: 'description',
    exercises: 'exercises',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  dietTemplates: {},
  clientRoutineAssignments: {}
}));

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

const templatesRouter = require('../templates');
const { db } = require('../db/db_config');
const { authenticateToken } = require('../authMiddleware');

const app = express();
app.use(express.json());
app.use('/api/templates', templatesRouter);

describe('Templates Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1, role: 'COACH' };
      next();
    });
    
    // Mock ensureCoach middleware - simula que el usuario es COACH
    db.select = jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ role: 'COACH' }])
        })
      })
    });
  });

  describe('GET /api/templates/routines', () => {
    it('should get routine templates for coach', async () => {
      const mockTemplates = [
        {
          template_id: 1,
          coach_id: 1,
          name: 'Test Routine',
          description: 'Test description',
          exercises: [{ exercise_id: 1, sets: 3, reps: 10 }],
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Mock para ensureCoach (primera llamada)
      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'COACH' }])
            })
          })
        })
        // Mock para obtener templates (segunda llamada)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockTemplates)
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
    });
  });

  describe('GET /api/templates/routines/predefined', () => {
    beforeEach(() => {
      // Mock para buscar usuario sistema
      db.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { user_id: 999, email: 'system@fitnessapp.com' }
            ])
          })
        })
      });
    });

    it('should get predefined routines', async () => {
      const mockPredefinedTemplates = [
        {
          template_id: 100,
          coach_id: 999,
          name: 'Rutina Full Body Principiante',
          description: 'Rutina completa para principiantes',
          exercises: {
            exercises: [
              { exercise_id: 1, exercise_name: 'Sentadilla', sets: 3, reps: 10, day_of_week: 1 }
            ],
            metadata: {
              trainingType: 'strength',
              level: 'beginner',
              frequency: 3,
              equipment: ['barbell', 'dumbbells'],
              tags: ['full_body', 'beginner'],
              notes: 'Descansar 48 horas entre sesiones'
            }
          },
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Mock para obtener rutinas predefinidas
      // Primera llamada: buscar usuario sistema
      // Segunda llamada: obtener templates (con where y orderBy en cadena)
      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { user_id: 999, email: 'system@fitnessapp.com' }
              ])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockPredefinedTemplates)
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.templates)).toBe(true);
    });

    it('should filter predefined routines by trainingType', async () => {
      const mockTemplates = [
        {
          template_id: 100,
          coach_id: 999,
          name: 'Rutina Full Body Principiante',
          exercises: {
            exercises: [],
            metadata: { trainingType: 'strength', level: 'beginner', frequency: 3 }
          }
        },
        {
          template_id: 101,
          coach_id: 999,
          name: 'Rutina Cardio',
          exercises: {
            exercises: [],
            metadata: { trainingType: 'cardio', level: 'intermediate', frequency: 5 }
          }
        }
      ];

      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockTemplates)
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined?trainingType=strength')
        .expect(200);

      expect(response.body.templates.length).toBe(1);
      expect(response.body.templates[0].trainingType).toBe('strength');
    });

    it('should filter predefined routines by level', async () => {
      const mockTemplates = [
        {
          template_id: 100,
          coach_id: 999,
          name: 'Rutina Principiante',
          exercises: {
            exercises: [],
            metadata: { trainingType: 'strength', level: 'beginner', frequency: 3 }
          }
        }
      ];

      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockTemplates)
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined?level=beginner')
        .expect(200);

      expect(response.body.templates.length).toBe(1);
      expect(response.body.templates[0].level).toBe('beginner');
    });

    it('should filter predefined routines by frequency', async () => {
      const mockTemplates = [
        {
          template_id: 100,
          coach_id: 999,
          name: 'Rutina 3 días',
          exercises: {
            exercises: [],
            metadata: { trainingType: 'strength', level: 'beginner', frequency: 3 }
          }
        },
        {
          template_id: 101,
          coach_id: 999,
          name: 'Rutina 5 días',
          exercises: {
            exercises: [],
            metadata: { trainingType: 'cardio', level: 'intermediate', frequency: 5 }
          }
        }
      ];

      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockTemplates)
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined?frequency=3')
        .expect(200);

      expect(response.body.templates.length).toBe(1);
      expect(response.body.templates[0].frequency).toBe(3);
    });

    it('should handle multiple filters simultaneously', async () => {
      const mockTemplates = [
        {
          template_id: 100,
          coach_id: 999,
          name: 'Rutina Strength Beginner',
          exercises: {
            exercises: [],
            metadata: { trainingType: 'strength', level: 'beginner', frequency: 3 }
          }
        },
        {
          template_id: 101,
          coach_id: 999,
          name: 'Rutina Cardio Intermediate',
          exercises: {
            exercises: [],
            metadata: { trainingType: 'cardio', level: 'intermediate', frequency: 5 }
          }
        }
      ];

      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockTemplates)
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined?trainingType=strength&level=beginner')
        .expect(200);

      expect(response.body.templates.length).toBe(1);
      expect(response.body.templates[0].trainingType).toBe('strength');
      expect(response.body.templates[0].level).toBe('beginner');
    });

    it('should handle empty results gracefully', async () => {
      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([])
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined')
        .expect(200);

      expect(response.body.templates).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should handle templates with exercises as array directly', async () => {
      const mockTemplates = [
        {
          template_id: 100,
          coach_id: 999,
          name: 'Rutina Simple',
          exercises: [
            { exercise_id: 1, exercise_name: 'Sentadilla', sets: 3, reps: 10 }
          ]
        }
      ];

      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockTemplates)
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined')
        .expect(200);

      expect(response.body.templates.length).toBe(1);
      expect(Array.isArray(response.body.templates[0].exercises)).toBe(true);
    });

    it('should return 404 if system user not found', async () => {
      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined')
        .expect(404);

      expect(response.body.error).toContain('No se encontraron rutinas predefinidas');
    });
  });

  describe('GET /api/templates/routines/predefined/:id', () => {
    it('should get a specific predefined routine', async () => {
      const mockTemplate = {
        template_id: 100,
        coach_id: 999,
        name: 'Rutina Full Body Principiante',
        description: 'Rutina completa',
        exercises: {
          exercises: [
            { exercise_id: 1, exercise_name: 'Sentadilla', sets: 3, reps: 10 }
          ],
          metadata: {
            trainingType: 'strength',
            level: 'beginner',
            frequency: 3
          }
        }
      };

      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockTemplate])
            })
          })
        });

      const response = await request(app)
        .get('/api/templates/routines/predefined/100')
        .expect(200);

      expect(response.body).toHaveProperty('template');
      expect(response.body.template.template_id).toBe(100);
      expect(response.body.template.trainingType).toBe('strength');
    });

    it('should return 404 if predefined routine not found', async () => {
      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        });

      await request(app)
        .get('/api/templates/routines/predefined/999')
        .expect(404);
    });
  });

  describe('POST /api/templates/routines/predefined/:id/duplicate', () => {
    beforeEach(() => {
      // Mock ensureCoach middleware
      db.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ role: 'COACH' }])
          })
        })
      });
    });

    it('should duplicate a predefined routine for coach', async () => {
      const mockPredefinedTemplate = {
        template_id: 100,
        coach_id: 999,
        name: 'Rutina Full Body Principiante',
        description: 'Rutina completa',
        exercises: {
          exercises: [
            { exercise_id: 1, exercise_name: 'Sentadilla', sets: 3, reps: 10 }
          ]
        }
      };

      const mockNewTemplate = {
        template_id: 200,
        coach_id: 1,
        name: 'Rutina Full Body Principiante (Copia)',
        description: 'Rutina completa',
        exercises: mockPredefinedTemplate.exercises.exercises
      };

      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'COACH' }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockPredefinedTemplate])
            })
          })
        });

      db.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewTemplate])
        })
      });

      const response = await request(app)
        .post('/api/templates/routines/predefined/100/duplicate')
        .expect(201);

      expect(response.body).toHaveProperty('template');
      expect(response.body.template.coach_id).toBe(1);
      expect(response.body.template.name).toContain('Copia');
    });

    it('should allow custom name when duplicating', async () => {
      const mockPredefinedTemplate = {
        template_id: 100,
        coach_id: 999,
        name: 'Rutina Original',
        exercises: { exercises: [] }
      };

      const mockNewTemplate = {
        template_id: 200,
        coach_id: 1,
        name: 'Mi Rutina Personalizada',
        exercises: []
      };

      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'COACH' }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockPredefinedTemplate])
            })
          })
        });

      db.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockNewTemplate])
        })
      });

      const response = await request(app)
        .post('/api/templates/routines/predefined/100/duplicate')
        .send({ name: 'Mi Rutina Personalizada' })
        .expect(201);

      expect(response.body.template.name).toBe('Mi Rutina Personalizada');
    });

    it('should return 404 if predefined routine not found', async () => {
      db.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ role: 'COACH' }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([{ user_id: 999 }])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        });

      await request(app)
        .post('/api/templates/routines/predefined/999/duplicate')
        .expect(404);
    });
  });
});

