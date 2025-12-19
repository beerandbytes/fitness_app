const express = require('express');
const router = express.Router();

const authenticateToken = require('./authMiddleware');
const { db } = require('../db/db_config');
const schema = require('../db/schema');
const logger = require('../utils/logger');

const { users, routineTemplates, dietTemplates, clientRoutineAssignments } = schema;
const { eq, and, desc, asc } = require('drizzle-orm');

// Middleware para asegurar que el usuario es COACH o ADMIN
function ensureCoach(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'No autenticado.' });
    }
    
    db.select({ role: users.role })
        .from(users)
        .where(eq(users.user_id, req.user.id))
        .limit(1)
        .then(([user]) => {
            if (!user || (user.role !== 'COACH' && user.role !== 'ADMIN')) {
                return res.status(403).json({ error: 'Solo los entrenadores pueden acceder a esta ruta.' });
            }
            req.user.role = user.role;
            next();
        })
        .catch((error) => {
            logger.error('Error verificando rol de usuario:', { error: error.message });
            return res.status(500).json({ error: 'Error interno del servidor.' });
        });
}

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// =================================================================
// PREDEFINED ROUTINE TEMPLATES (disponibles para todos los usuarios autenticados)
// Estas rutas deben estar ANTES de ensureCoach
// =================================================================

/**
 * @swagger
 * /api/templates/routines/predefined:
 *   get:
 *     summary: Obtener todas las rutinas predefinidas del sistema
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trainingType
 *         schema:
 *           type: string
 *           enum: [strength, cardio, endurance, flexibility, hiit, hybrid]
 *         description: Filtrar por tipo de entrenamiento
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filtrar por nivel
 *       - in: query
 *         name: frequency
 *         schema:
 *           type: integer
 *         description: Filtrar por días por semana
 *     responses:
 *       200:
 *         description: Lista de rutinas predefinidas
 */
// GET /api/templates/routines/predefined - Obtener rutinas predefinidas del sistema
router.get('/routines/predefined', async (req, res) => {
    try {
        // Obtener el coach_id del sistema desde variable de entorno o buscar por email
        const systemCoachId = process.env.SYSTEM_COACH_ID 
            ? parseInt(process.env.SYSTEM_COACH_ID) 
            : null;

        let coachId = systemCoachId;

        if (!coachId) {
            // Buscar usuario sistema por email
            const systemUsers = await db.select()
                .from(users)
                .where(eq(users.email, 'system@fitnessapp.com'))
                .limit(1);

            if (systemUsers.length === 0) {
                return res.status(404).json({ 
                    error: 'No se encontraron rutinas predefinidas. Configure SYSTEM_COACH_ID en .env' 
                });
            }
            coachId = systemUsers[0].user_id;
        }

        // Aplicar filtros si se proporcionan
        const { trainingType, level, frequency } = req.query;
        
        // Construir query completa en una sola cadena
        logger.info('Obteniendo rutinas predefinidas', { coachId, trainingType, level, frequency });
        
        const templates = await db.select()
            .from(routineTemplates)
            .where(eq(routineTemplates.coach_id, coachId))
            .orderBy(desc(routineTemplates.created_at));

        logger.info('Rutinas obtenidas de BD', { count: templates.length });

        // Filtrar en memoria según los parámetros
        let filteredTemplates = templates;

        if (trainingType) {
            filteredTemplates = filteredTemplates.filter(t => {
                try {
                    if (!t.exercises) return false;
                    const metadata = (typeof t.exercises === 'object' && !Array.isArray(t.exercises))
                        ? t.exercises.metadata
                        : null;
                    return metadata && metadata.trainingType === trainingType;
                } catch (err) {
                    logger.warn('Error filtrando por trainingType', { 
                        templateId: t.template_id, 
                        error: err.message 
                    });
                    return false;
                }
            });
        }

        if (level) {
            filteredTemplates = filteredTemplates.filter(t => {
                try {
                    if (!t.exercises) return false;
                    const metadata = (typeof t.exercises === 'object' && !Array.isArray(t.exercises))
                        ? t.exercises.metadata
                        : null;
                    return metadata && metadata.level === level;
                } catch (err) {
                    logger.warn('Error filtrando por level', { 
                        templateId: t.template_id, 
                        error: err.message 
                    });
                    return false;
                }
            });
        }

        if (frequency) {
            const frequencyNum = parseInt(frequency);
            if (!isNaN(frequencyNum)) {
                filteredTemplates = filteredTemplates.filter(t => {
                    try {
                        if (!t.exercises) return false;
                        const metadata = (typeof t.exercises === 'object' && !Array.isArray(t.exercises))
                            ? t.exercises.metadata
                            : null;
                        return metadata && metadata.frequency === frequencyNum;
                    } catch (err) {
                        logger.warn('Error filtrando por frequency', { 
                            templateId: t.template_id, 
                            error: err.message 
                        });
                        return false;
                    }
                });
            }
        }

        // Extraer metadatos de cada plantilla
        const templatesWithMetadata = filteredTemplates.map(template => {
            try {
                let metadata = {};
                let exercisesList = [];

                if (template.exercises) {
                    if (typeof template.exercises === 'object' && !Array.isArray(template.exercises)) {
                        metadata = template.exercises.metadata || {};
                        exercisesList = template.exercises.exercises || [];
                    } else if (Array.isArray(template.exercises)) {
                        exercisesList = template.exercises;
                    }
                }

                return {
                    template_id: template.template_id,
                    coach_id: template.coach_id,
                    name: template.name,
                    description: template.description,
                    exercises: exercisesList,
                    created_at: template.created_at,
                    updated_at: template.updated_at,
                    trainingType: metadata.trainingType || null,
                    level: metadata.level || null,
                    frequency: metadata.frequency || null,
                    equipment: metadata.equipment || null,
                    tags: metadata.tags || null,
                    notes: metadata.notes || null
                };
            } catch (err) {
                logger.warn('Error procesando plantilla', { 
                    templateId: template.template_id, 
                    error: err.message,
                    stack: err.stack
                });
                return {
                    template_id: template.template_id,
                    coach_id: template.coach_id,
                    name: template.name || '',
                    description: template.description || '',
                    exercises: [],
                    created_at: template.created_at,
                    updated_at: template.updated_at,
                    trainingType: null,
                    level: null,
                    frequency: null,
                    equipment: null,
                    tags: null,
                    notes: null
                };
            }
        });

        return res.status(200).json({
            message: 'Rutinas predefinidas obtenidas exitosamente.',
            templates: templatesWithMetadata,
            count: templatesWithMetadata.length
        });
    } catch (error) {
        logger.error('Error obteniendo rutinas predefinidas:', { 
            error: error.message, 
            stack: error.stack,
            queryParams: req.query
        });
        return res.status(500).json({ 
            error: 'Error interno del servidor al obtener rutinas predefinidas.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/templates/routines/predefined/:id - Obtener una rutina predefinida específica
router.get('/routines/predefined/:id', async (req, res) => {
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla predefinida');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        const systemCoachId = process.env.SYSTEM_COACH_ID 
            ? parseInt(process.env.SYSTEM_COACH_ID) 
            : null;

        let coachId = systemCoachId;

        if (!coachId) {
            const systemUsers = await db.select()
                .from(users)
                .where(eq(users.email, 'system@fitnessapp.com'))
                .limit(1);

            if (systemUsers.length === 0) {
                return res.status(404).json({ error: 'Rutina predefinida no encontrada.' });
            }
            coachId = systemUsers[0].user_id;
        }

        const templates = await db.select()
            .from(routineTemplates)
            .where(
                and(
                    eq(routineTemplates.template_id, templateId),
                    eq(routineTemplates.coach_id, coachId)
                )
            )
            .limit(1);

        if (templates.length === 0) {
            return res.status(404).json({ error: 'Rutina predefinida no encontrada.' });
        }

        const template = templates[0];
        const metadata = template.exercises?.metadata || {};
        const exercisesList = template.exercises?.exercises || template.exercises || [];

        return res.status(200).json({
            message: 'Rutina predefinida obtenida exitosamente.',
            template: {
                template_id: template.template_id,
                coach_id: template.coach_id,
                name: template.name,
                description: template.description,
                exercises: exercisesList,
                created_at: template.created_at,
                updated_at: template.updated_at,
                trainingType: metadata.trainingType,
                level: metadata.level,
                frequency: metadata.frequency,
                equipment: metadata.equipment,
                tags: metadata.tags,
                notes: metadata.notes
            }
        });
    } catch (error) {
        logger.error('Error obteniendo rutina predefinida:', { 
            error: error.message, 
            stack: error.stack 
        });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Aplicar ensureCoach solo a rutas que requieren rol COACH
router.use(ensureCoach);

// =================================================================
// ROUTINE TEMPLATES (requieren rol COACH)
// =================================================================

// GET /api/templates/routines - Obtener todas las plantillas de rutinas del coach
router.get('/routines', async (req, res) => {
    const coachId = req.user.id;

    try {
        const templates = await db
            .select()
            .from(routineTemplates)
            .where(eq(routineTemplates.coach_id, coachId))
            .orderBy(desc(routineTemplates.created_at));

        return res.status(200).json({
            message: 'Plantillas de rutinas obtenidas exitosamente.',
            templates,
        });
    } catch (error) {
        // Capturar el error real de PostgreSQL si está disponible
        // Drizzle a veces envuelve el error en error.cause
        const pgError = error.cause || error.original || error;
        const errorDetails = {
            message: error.message,
            pgCode: pgError.code,
            pgMessage: pgError.message,
            pgDetail: pgError.detail,
            pgHint: pgError.hint,
            pgWhere: pgError.where,
            stack: error.stack,
            coachId,
            fullError: error.toString()
        };
        
        logger.error('Error obteniendo plantillas de rutinas:', errorDetails);
        
        // Proporcionar un mensaje más útil al cliente
        let userMessage = 'Error interno del servidor al cargar las plantillas.';
        if (pgError.code === '42P01') {
            userMessage = 'La tabla de plantillas no existe. Por favor, ejecuta las migraciones de la base de datos.';
        } else if (pgError.code === '42703') {
            userMessage = 'Error en el esquema de la base de datos. La columna especificada no existe.';
        } else if (pgError.message && pgError.message.includes('relation') && pgError.message.includes('does not exist')) {
            userMessage = 'La tabla de plantillas no existe. Por favor, ejecuta las migraciones de la base de datos.';
        } else if (pgError.message) {
            userMessage = `Error de base de datos: ${pgError.message}`;
        }
        
        return res.status(500).json({ 
            error: userMessage,
            details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
        });
    }
});

// Función helper para validar IDs
function validateId(id, paramName = 'ID') {
    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`${paramName} inválido: ${id}`);
    }
    return parsedId;
}

// GET /api/templates/routines/:id - Obtener una plantilla específica
router.get('/routines/:id', async (req, res) => {
    const coachId = req.user.id;
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        const templates = await db
            .select()
            .from(routineTemplates)
            .where(and(
                eq(routineTemplates.template_id, templateId),
                eq(routineTemplates.coach_id, coachId)
            ))
            .limit(1);

        if (templates.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada.' });
        }

        return res.status(200).json({
            message: 'Plantilla obtenida exitosamente.',
            template: templates[0],
        });
    } catch (error) {
        logger.error('Error obteniendo plantilla de rutina:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// POST /api/templates/routines - Crear nueva plantilla de rutina
router.post('/routines', async (req, res) => {
    const coachId = req.user.id;
    const { name, description, exercises } = req.body;

    if (!name || !exercises || !Array.isArray(exercises)) {
        return res.status(400).json({ error: 'Nombre y ejercicios son requeridos.' });
    }

    try {
        const newTemplate = await db
            .insert(routineTemplates)
            .values({
                coach_id: coachId,
                name,
                description: description || null,
                exercises: exercises,
            })
            .returning();

        return res.status(201).json({
            message: 'Plantilla de rutina creada exitosamente.',
            template: newTemplate[0],
        });
    } catch (error) {
        logger.error('Error creando plantilla de rutina:', { error: error.message, stack: error.stack, coachId });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// PUT /api/templates/routines/:id - Actualizar plantilla de rutina
router.put('/routines/:id', async (req, res) => {
    const coachId = req.user.id;
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
    
    const { name, description, exercises } = req.body;

    try {
        // Verificar que la plantilla pertenece al coach
        const existing = await db
            .select()
            .from(routineTemplates)
            .where(and(
                eq(routineTemplates.template_id, templateId),
                eq(routineTemplates.coach_id, coachId)
            ))
            .limit(1);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada.' });
        }

        const updated = await db
            .update(routineTemplates)
            .set({
                name: name || existing[0].name,
                description: description !== undefined ? description : existing[0].description,
                exercises: exercises || existing[0].exercises,
                updated_at: new Date(),
            })
            .where(eq(routineTemplates.template_id, templateId))
            .returning();

        return res.status(200).json({
            message: 'Plantilla de rutina actualizada exitosamente.',
            template: updated[0],
        });
    } catch (error) {
        logger.error('Error actualizando plantilla de rutina:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// DELETE /api/templates/routines/:id - Eliminar plantilla de rutina
router.delete('/routines/:id', async (req, res) => {
    const coachId = req.user.id;
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        // Verificar que la plantilla pertenece al coach
        const existing = await db
            .select()
            .from(routineTemplates)
            .where(and(
                eq(routineTemplates.template_id, templateId),
                eq(routineTemplates.coach_id, coachId)
            ))
            .limit(1);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada.' });
        }

        await db
            .delete(routineTemplates)
            .where(eq(routineTemplates.template_id, templateId));

        return res.status(200).json({
            message: 'Plantilla de rutina eliminada exitosamente.',
        });
    } catch (error) {
        logger.error('Error eliminando plantilla de rutina:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// =================================================================
// PREDEFINED ROUTINE TEMPLATES (continuación - rutas que requieren COACH)
// =================================================================

/**
 * @swagger
 * /api/templates/routines/predefined/{id}:
 *   get:
 *     summary: Obtener una rutina predefinida específica
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la plantilla predefinida
 *     responses:
 *       200:
 *         description: Rutina predefinida encontrada
 *       404:
 *         description: Rutina predefinida no encontrada
 */
// GET /api/templates/routines/predefined/:id - Obtener una rutina predefinida específica
router.get('/routines/predefined/:id', async (req, res) => {
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla predefinida');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        const systemCoachId = process.env.SYSTEM_COACH_ID 
            ? parseInt(process.env.SYSTEM_COACH_ID) 
            : null;

        let coachId = systemCoachId;

        if (!coachId) {
            const systemUsers = await db.select()
                .from(users)
                .where(eq(users.email, 'system@fitnessapp.com'))
                .limit(1);

            if (systemUsers.length === 0) {
                return res.status(404).json({ error: 'Rutina predefinida no encontrada.' });
            }
            coachId = systemUsers[0].user_id;
        }

        const templates = await db.select()
            .from(routineTemplates)
            .where(
                and(
                    eq(routineTemplates.template_id, templateId),
                    eq(routineTemplates.coach_id, coachId)
                )
            )
            .limit(1);

        if (templates.length === 0) {
            return res.status(404).json({ error: 'Rutina predefinida no encontrada.' });
        }

        const template = templates[0];
        const metadata = template.exercises?.metadata || {};
        const exercisesList = template.exercises?.exercises || template.exercises || [];

        return res.status(200).json({
            message: 'Rutina predefinida obtenida exitosamente.',
            template: {
                ...template,
                exercises: exercisesList, // Solo los ejercicios
                trainingType: metadata.trainingType,
                level: metadata.level,
                frequency: metadata.frequency,
                equipment: metadata.equipment,
                tags: metadata.tags,
                notes: metadata.notes
            }
        });
    } catch (error) {
        logger.error('Error obteniendo rutina predefinida:', { 
            error: error.message, 
            stack: error.stack 
        });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/**
 * @swagger
 * /api/templates/routines/predefined/{id}/duplicate:
 *   post:
 *     summary: Duplicar una rutina predefinida para el entrenador
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la plantilla predefinida a duplicar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre personalizado para la copia (opcional)
 *               description:
 *                 type: string
 *                 description: Descripción personalizada (opcional)
 *     responses:
 *       201:
 *         description: Rutina duplicada exitosamente
 *       404:
 *         description: Rutina predefinida no encontrada
 */
// POST /api/templates/routines/predefined/:id/duplicate - Duplicar rutina predefinida
router.post('/routines/predefined/:id/duplicate', async (req, res) => {
    const coachId = req.user.id;
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla predefinida');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
    
    const { name, description } = req.body;

    try {
        // Obtener el coach_id del sistema
        const systemCoachId = process.env.SYSTEM_COACH_ID 
            ? parseInt(process.env.SYSTEM_COACH_ID) 
            : null;

        let systemCoach = systemCoachId;

        if (!systemCoach) {
            const systemUsers = await db.select()
                .from(users)
                .where(eq(users.email, 'system@fitnessapp.com'))
                .limit(1);

            if (systemUsers.length === 0) {
                return res.status(404).json({ error: 'Rutina predefinida no encontrada.' });
            }
            systemCoach = systemUsers[0].user_id;
        }

        // Obtener la plantilla predefinida
        const predefinedTemplates = await db.select()
            .from(routineTemplates)
            .where(
                and(
                    eq(routineTemplates.template_id, templateId),
                    eq(routineTemplates.coach_id, systemCoach)
                )
            )
            .limit(1);

        if (predefinedTemplates.length === 0) {
            return res.status(404).json({ error: 'Rutina predefinida no encontrada.' });
        }

        const predefinedTemplate = predefinedTemplates[0];

        // Extraer ejercicios reales (sin metadatos del sistema)
        const exercisesList = predefinedTemplate.exercises?.exercises || predefinedTemplate.exercises || [];

        // Crear copia para el entrenador (sin metadatos del sistema)
        const [newTemplate] = await db.insert(routineTemplates)
            .values({
                coach_id: coachId,
                name: name || `${predefinedTemplate.name} (Copia)`,
                description: description !== undefined ? description : predefinedTemplate.description,
                exercises: exercisesList // Solo los ejercicios, el entrenador puede agregar sus propios metadatos
            })
            .returning();

        logger.info(`Rutina predefinida duplicada: ${templateId} -> ${newTemplate.template_id} por coach ${coachId}`);

        return res.status(201).json({
            message: 'Rutina predefinida duplicada exitosamente.',
            template: newTemplate
        });
    } catch (error) {
        logger.error('Error duplicando rutina predefinida:', { 
            error: error.message, 
            stack: error.stack,
            coachId,
            templateId 
        });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// =================================================================
// DIET TEMPLATES
// =================================================================

// GET /api/templates/diets - Obtener todas las plantillas de dietas del coach
router.get('/diets', async (req, res) => {
    const coachId = req.user.id;

    try {
        const templates = await db
            .select()
            .from(dietTemplates)
            .where(eq(dietTemplates.coach_id, coachId))
            .orderBy(desc(dietTemplates.created_at));

        return res.status(200).json({
            message: 'Plantillas de dietas obtenidas exitosamente.',
            templates,
        });
    } catch (error) {
        // Capturar el error real de PostgreSQL si está disponible
        // Drizzle a veces envuelve el error en error.cause
        const pgError = error.cause || error.original || error;
        const errorDetails = {
            message: error.message,
            pgCode: pgError.code,
            pgMessage: pgError.message,
            pgDetail: pgError.detail,
            pgHint: pgError.hint,
            pgWhere: pgError.where,
            stack: error.stack,
            coachId,
            fullError: error.toString()
        };
        
        logger.error('Error obteniendo plantillas de dietas:', errorDetails);
        
        // Proporcionar un mensaje más útil al cliente
        let userMessage = 'Error interno del servidor al cargar las plantillas.';
        if (pgError.code === '42P01') {
            userMessage = 'La tabla de plantillas no existe. Por favor, ejecuta las migraciones de la base de datos.';
        } else if (pgError.code === '42703') {
            userMessage = 'Error en el esquema de la base de datos. La columna especificada no existe.';
        } else if (pgError.message && pgError.message.includes('relation') && pgError.message.includes('does not exist')) {
            userMessage = 'La tabla de plantillas no existe. Por favor, ejecuta las migraciones de la base de datos.';
        } else if (pgError.message) {
            userMessage = `Error de base de datos: ${pgError.message}`;
        }
        
        return res.status(500).json({ 
            error: userMessage,
            details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
        });
    }
});

// GET /api/templates/diets/:id - Obtener una plantilla específica
router.get('/diets/:id', async (req, res) => {
    const coachId = req.user.id;
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        const templates = await db
            .select()
            .from(dietTemplates)
            .where(and(
                eq(dietTemplates.template_id, templateId),
                eq(dietTemplates.coach_id, coachId)
            ))
            .limit(1);

        if (templates.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada.' });
        }

        return res.status(200).json({
            message: 'Plantilla obtenida exitosamente.',
            template: templates[0],
        });
    } catch (error) {
        logger.error('Error obteniendo plantilla de dieta:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// POST /api/templates/diets - Crear nueva plantilla de dieta
router.post('/diets', async (req, res) => {
    const coachId = req.user.id;
    const { name, description, meals, target_macros } = req.body;

    if (!name || !meals || !Array.isArray(meals)) {
        return res.status(400).json({ error: 'Nombre y comidas son requeridos.' });
    }

    try {
        const newTemplate = await db
            .insert(dietTemplates)
            .values({
                coach_id: coachId,
                name,
                description: description || null,
                meals: meals,
                target_macros: target_macros || null,
            })
            .returning();

        return res.status(201).json({
            message: 'Plantilla de dieta creada exitosamente.',
            template: newTemplate[0],
        });
    } catch (error) {
        logger.error('Error creando plantilla de dieta:', { error: error.message, stack: error.stack, coachId });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// PUT /api/templates/diets/:id - Actualizar plantilla de dieta
router.put('/diets/:id', async (req, res) => {
    const coachId = req.user.id;
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
    
    const { name, description, meals, target_macros } = req.body;

    try {
        const existing = await db
            .select()
            .from(dietTemplates)
            .where(and(
                eq(dietTemplates.template_id, templateId),
                eq(dietTemplates.coach_id, coachId)
            ))
            .limit(1);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada.' });
        }

        const updated = await db
            .update(dietTemplates)
            .set({
                name: name || existing[0].name,
                description: description !== undefined ? description : existing[0].description,
                meals: meals || existing[0].meals,
                target_macros: target_macros !== undefined ? target_macros : existing[0].target_macros,
                updated_at: new Date(),
            })
            .where(eq(dietTemplates.template_id, templateId))
            .returning();

        return res.status(200).json({
            message: 'Plantilla de dieta actualizada exitosamente.',
            template: updated[0],
        });
    } catch (error) {
        logger.error('Error actualizando plantilla de dieta:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// DELETE /api/templates/diets/:id - Eliminar plantilla de dieta
router.delete('/diets/:id', async (req, res) => {
    const coachId = req.user.id;
    let templateId;
    
    try {
        templateId = validateId(req.params.id, 'ID de plantilla');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        const existing = await db
            .select()
            .from(dietTemplates)
            .where(and(
                eq(dietTemplates.template_id, templateId),
                eq(dietTemplates.coach_id, coachId)
            ))
            .limit(1);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada.' });
        }

        await db
            .delete(dietTemplates)
            .where(eq(dietTemplates.template_id, templateId));

        return res.status(200).json({
            message: 'Plantilla de dieta eliminada exitosamente.',
        });
    } catch (error) {
        logger.error('Error eliminando plantilla de dieta:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// =================================================================
// CLIENT ROUTINE ASSIGNMENTS
// =================================================================

// POST /api/templates/assign - Asignar rutina a cliente
router.post('/assign', async (req, res) => {
    const coachId = req.user.id;
    const { client_id, template_id, assigned_date, is_recurring, recurring_day } = req.body;

    if (!client_id || !template_id || !assigned_date) {
        return res.status(400).json({ error: 'client_id, template_id y assigned_date son requeridos.' });
    }

    try {
        // Verificar que el cliente pertenece al coach
        const client = await db
            .select()
            .from(users)
            .where(and(
                eq(users.user_id, client_id),
                eq(users.coach_id, coachId)
            ))
            .limit(1);

        if (client.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado o no tienes permisos.' });
        }

        // Verificar que la plantilla pertenece al coach
        const template = await db
            .select()
            .from(routineTemplates)
            .where(and(
                eq(routineTemplates.template_id, template_id),
                eq(routineTemplates.coach_id, coachId)
            ))
            .limit(1);

        if (template.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada.' });
        }

        const assignment = await db
            .insert(clientRoutineAssignments)
            .values({
                client_id,
                template_id,
                assigned_date,
                is_recurring: is_recurring || false,
                recurring_day: is_recurring ? recurring_day : null,
            })
            .returning();

        return res.status(201).json({
            message: 'Rutina asignada exitosamente.',
            assignment: assignment[0],
        });
    } catch (error) {
        logger.error('Error asignando rutina:', { error: error.message, stack: error.stack, coachId });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// GET /api/templates/assignments/:clientId - Obtener asignaciones de un cliente
router.get('/assignments/:clientId', async (req, res) => {
    const coachId = req.user.id;
    let clientId;
    
    try {
        clientId = validateId(req.params.clientId, 'ID de cliente');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        // Verificar que el cliente pertenece al coach
        const client = await db
            .select()
            .from(users)
            .where(and(
                eq(users.user_id, clientId),
                eq(users.coach_id, coachId)
            ))
            .limit(1);

        if (client.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado o no tienes permisos.' });
        }

        const assignments = await db
            .select({
                assignment_id: clientRoutineAssignments.assignment_id,
                template_id: clientRoutineAssignments.template_id,
                assigned_date: clientRoutineAssignments.assigned_date,
                is_recurring: clientRoutineAssignments.is_recurring,
                recurring_day: clientRoutineAssignments.recurring_day,
                template_name: routineTemplates.name,
                template_exercises: routineTemplates.exercises,
            })
            .from(clientRoutineAssignments)
            .innerJoin(routineTemplates, eq(clientRoutineAssignments.template_id, routineTemplates.template_id))
            .where(eq(clientRoutineAssignments.client_id, clientId))
            .orderBy(asc(clientRoutineAssignments.assigned_date));

        return res.status(200).json({
            message: 'Asignaciones obtenidas exitosamente.',
            assignments,
        });
    } catch (error) {
        logger.error('Error obteniendo asignaciones:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;

