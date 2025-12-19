/**
 * @swagger
 * tags:
 *   name: Routines
 *   description: Gestión de rutinas de entrenamiento
 */

// /routes/routines.js

const express = require('express');
const router = express.Router();
const authenticateToken = require('./authMiddleware'); 
const PDFDocument = require('pdfkit');

const { db } = require('../db/db_config'); 
const schema = require('../db/schema'); 
const { routines, routineExercises, exercises, routineTemplates, users, scheduledRoutines } = schema; 
const { eq, and, asc, isNull, sql, count, or } = require('drizzle-orm');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler'); 

/**
 * @swagger
 * /api/routines:
 *   post:
 *     summary: Crear una nueva rutina
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Rutina creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routine:
 *                   $ref: '#/components/schemas/Routine'
 */
// --- RUTA: POST /api/routines ---
// 1. Crear una nueva rutina para el usuario logeado
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { name, description } = req.body; 

    if (!name) {
        return res.status(400).json({ error: 'El nombre de la rutina es obligatorio.' });
    }

    const newRoutine = await db.insert(routines).values({
        user_id: user_id,
        name: name,
        description: description || null, 
    }).returning({
        routine_id: routines.routine_id,
        name: routines.name,
        description: routines.description,
        is_active: routines.is_active,
    });

    return res.status(201).json({
        message: 'Rutina creada con éxito.',
        routine: newRoutine[0] 
    });
}));

// POST /api/routines/from-template - Crear rutina a partir de una plantilla
router.post('/from-template', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { 
        template_id, 
        schedule_weeks, 
        schedule_days_of_week, 
        schedule_start_date 
    } = req.body;

    if (!template_id) {
        return res.status(400).json({ error: 'template_id es obligatorio.' });
    }

    // Validar parámetros opcionales de planificación
    let weeks = 4; // default
    if (schedule_weeks !== undefined) {
        weeks = parseInt(schedule_weeks);
        if (isNaN(weeks) || weeks < 1 || weeks > 12) {
            return res.status(400).json({ error: 'schedule_weeks debe ser un número entre 1 y 12.' });
        }
    }

    let daysOfWeek = null; // null significa usar días de los ejercicios
    if (schedule_days_of_week !== undefined) {
        if (!Array.isArray(schedule_days_of_week)) {
            return res.status(400).json({ error: 'schedule_days_of_week debe ser un array.' });
        }
        daysOfWeek = schedule_days_of_week.map(d => parseInt(d)).filter(d => !isNaN(d) && d >= 0 && d <= 6);
        if (daysOfWeek.length === 0) {
            return res.status(400).json({ error: 'schedule_days_of_week debe contener al menos un día válido (0-6).' });
        }
    }

    let startDate = null; // null significa usar hoy
    if (schedule_start_date !== undefined && schedule_start_date !== null) {
        startDate = new Date(schedule_start_date);
        if (isNaN(startDate.getTime())) {
            return res.status(400).json({ error: 'schedule_start_date debe ser una fecha válida.' });
        }
        startDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
    }

    try {
        // Obtener la plantilla
        // Puede ser predefinida (sistema) o del coach del usuario
        const templateResults = await db
            .select()
            .from(routineTemplates)
            .where(eq(routineTemplates.template_id, template_id))
            .limit(1);

        if (templateResults.length === 0) {
            return res.status(404).json({ error: 'Plantilla no encontrada.' });
        }

        const template = templateResults[0];

        // Extraer ejercicios de la estructura JSONB
        // Puede ser: { exercises: [...], metadata: {...} } o directamente [...]
        let exercisesList = [];
        if (template.exercises) {
            if (template.exercises.exercises && Array.isArray(template.exercises.exercises)) {
                exercisesList = template.exercises.exercises;
            } else if (Array.isArray(template.exercises)) {
                exercisesList = template.exercises;
            }
        }

        if (exercisesList.length === 0) {
            return res.status(400).json({ error: 'La plantilla no tiene ejercicios.' });
        }

        // Crear la nueva rutina
        const [newRoutine] = await db.insert(routines).values({
            user_id: user_id,
            name: template.name,
            description: template.description || null,
            is_active: true,
        }).returning();

        // Verificar que los ejercicios existen y crear los registros en routine_exercises
        const validExercises = [];
        const skippedExercises = [];

        for (const templateExercise of exercisesList) {
            // Verificar que el ejercicio existe
            const exerciseCheck = await db
                .select()
                .from(exercises)
                .where(eq(exercises.exercise_id, templateExercise.exercise_id))
                .limit(1);

            if (exerciseCheck.length === 0) {
                skippedExercises.push(templateExercise.exercise_name || `ID: ${templateExercise.exercise_id}`);
                continue;
            }

            // Crear registro en routine_exercises
            validExercises.push({
                routine_id: newRoutine.routine_id,
                exercise_id: templateExercise.exercise_id,
                sets: templateExercise.sets || 3,
                reps: templateExercise.reps || null,
                duration_minutes: templateExercise.duration_minutes || null,
                weight_kg: templateExercise.weight_kg || 0,
                order_index: templateExercise.order_index || 1,
                day_of_week: templateExercise.day_of_week !== undefined ? templateExercise.day_of_week : null,
            });
        }

        // Insertar todos los ejercicios válidos
        if (validExercises.length > 0) {
            await db.insert(routineExercises).values(validExercises);
        } else {
            // Si no hay ejercicios válidos, eliminar la rutina creada
            await db.delete(routines).where(eq(routines.routine_id, newRoutine.routine_id));
            return res.status(400).json({ error: 'No se pudieron convertir los ejercicios de la plantilla. Ningún ejercicio es válido.' });
        }

        // Obtener la rutina completa con ejercicios para retornarla
        const results = await db
            .select({
                routineId: routines.routine_id,
                routineName: routines.name,
                routineDescription: routines.description,
                routineIsActive: routines.is_active,
                
                routineExerciseId: routineExercises.routine_exercise_id,
                exerciseId: exercises.exercise_id,
                exerciseName: exercises.name,
                exerciseNameEs: exercises.name_es,
                exerciseCategory: exercises.category,
                
                sets: routineExercises.sets,
                reps: routineExercises.reps,
                durationMinutes: routineExercises.duration_minutes,
                weightKg: routineExercises.weight_kg,
                orderIndex: routineExercises.order_index,
                dayOfWeek: routineExercises.day_of_week,
            })
            .from(routines)
            .leftJoin(routineExercises, eq(routineExercises.routine_id, routines.routine_id))
            .leftJoin(exercises, eq(routineExercises.exercise_id, exercises.exercise_id))
            .where(eq(routines.routine_id, newRoutine.routine_id))
            .orderBy(asc(routineExercises.day_of_week), asc(routineExercises.order_index));

        let routineData = null;
        let exercisesListResult = [];

        for (const row of results) {
            if (!routineData) {
                routineData = {
                    routine_id: row.routineId,
                    name: row.routineName,
                    description: row.routineDescription,
                    is_active: row.routineIsActive,
                    exercises: []
                };
            }
            
            if (row.exerciseId !== null) {
                exercisesListResult.push({
                    routine_exercise_id: row.routineExerciseId,
                    exercise_id: row.exerciseId,
                    name: row.exerciseNameEs || row.exerciseName,
                    name_es: row.exerciseNameEs,
                    category: row.exerciseCategory,
                    sets: row.sets,
                    reps: row.reps,
                    duration_minutes: row.durationMinutes,
                    weight_kg: row.weightKg,
                    order_index: row.orderIndex,
                    day_of_week: row.dayOfWeek,
                });
            }
        }

        if (routineData) {
            routineData.exercises = exercisesListResult;
        }

        // Planificación automática: programar la rutina según los días de la semana de los ejercicios
        try {
            // Determinar qué días programar
            let daysToSchedule;
            if (daysOfWeek !== null && daysOfWeek.length > 0) {
                // Usar los días especificados en los parámetros
                daysToSchedule = daysOfWeek;
            } else {
                // Obtener días únicos de la semana que tienen ejercicios
                const uniqueDaysOfWeek = [...new Set(exercisesListResult
                    .map(ex => ex.day_of_week)
                    .filter(day => day !== null && day !== undefined))];

                // Si no hay días específicos, planificar para toda la semana (lunes a viernes)
                daysToSchedule = uniqueDaysOfWeek.length > 0 ? uniqueDaysOfWeek : [1, 2, 3, 4, 5]; // Lunes a Viernes por defecto
            }
            
            // Determinar fecha base (usar startDate si se proporciona, sino usar hoy)
            const baseDate = startDate || new Date();
            baseDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
            
            const scheduledDates = [];

            for (let week = 0; week < weeks; week++) {
                for (const dayOfWeek of daysToSchedule) {
                    const targetDate = new Date(baseDate);
                    
                    // Calcular el próximo día de la semana
                    const currentDay = baseDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
                    let daysUntilTarget = dayOfWeek - currentDay;
                    
                    // Si el día ya pasó esta semana, buscar en la próxima semana
                    if (daysUntilTarget <= 0) {
                        daysUntilTarget += 7;
                    }
                    
                    // Agregar semanas adicionales
                    daysUntilTarget += (week * 7);
                    
                    targetDate.setDate(baseDate.getDate() + daysUntilTarget);
                    
                    scheduledDates.push(targetDate.toISOString().split('T')[0]); // Formato YYYY-MM-DD
                }
            }

            // Insertar todas las fechas programadas (insertar individualmente para manejar conflictos)
            if (scheduledDates.length > 0) {
                for (const date of scheduledDates) {
                    try {
                        await db.insert(scheduledRoutines).values({
                            user_id: user_id,
                            routine_id: newRoutine.routine_id,
                            scheduled_date: date,
                            is_completed: false,
                        }).onConflictDoUpdate({
                            target: [
                                scheduledRoutines.user_id,
                                scheduledRoutines.routine_id,
                                scheduledRoutines.scheduled_date
                            ],
                            set: {
                                is_completed: false,
                                completed_at: null,
                                updated_at: new Date()
                            }
                        });
                    } catch (insertError) {
                        // Si hay un error de inserción (aunque onConflictDoUpdate debería manejarlo),
                        // simplemente continuamos con la siguiente fecha
                        logger.warn('Error al insertar fecha programada:', { 
                            error: insertError.message, 
                            date,
                            routine_id: newRoutine.routine_id 
                        });
                    }
                }
            }
        } catch (scheduleError) {
            // Log el error pero no fallar la creación de la rutina
            logger.warn('Error al planificar automáticamente la rutina:', { 
                error: scheduleError.message, 
                routine_id: newRoutine.routine_id,
                user_id 
            });
        }

        const responseMessage = skippedExercises.length > 0
            ? `Rutina creada con éxito. ${skippedExercises.length} ejercicio(s) omitido(s) por no existir en la base de datos.`
            : 'Rutina creada con éxito a partir de la plantilla.';

        return res.status(201).json({
            message: responseMessage,
            routine: routineData,
            warnings: skippedExercises.length > 0 ? { skipped_exercises: skippedExercises } : null
        });

    } catch (error) {
        logger.error('Error al crear rutina desde plantilla:', { error: error.message, stack: error.stack, user_id, template_id });
        return res.status(500).json({ error: 'Error interno del servidor al crear la rutina desde la plantilla.' });
    }
}));

/**
 * @swagger
 * /api/routines:
 *   get:
 *     summary: Listar todas las rutinas activas del usuario
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de rutinas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routines:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Routine'
 */
// --- RUTA: GET /api/routines ---
// 2. Listar todas las rutinas activas del usuario (con paginación)
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20)); // Máximo 100 por página
    const offset = (page - 1) * limit;

    // Obtener total de rutinas usando count()
    const totalResult = await db.select({ count: count() })
        .from(routines)
        .where(and(eq(routines.user_id, user_id), eq(routines.is_active, true)));

    const total = totalResult[0]?.count || 0;

    // Obtener rutinas con paginación
    const userRoutines = await db.select()
        .from(routines)
        .where(and(eq(routines.user_id, user_id), eq(routines.is_active, true)))
        .orderBy(asc(routines.routine_id))
        .limit(limit)
        .offset(offset);

    return res.status(200).json({
        message: 'Lista de rutinas activas cargada con éxito.',
        routines: userRoutines,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: offset + limit < total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        }
    });
}));


// --- RUTA: GET /api/routines/:routineId ---
// 3. Obtener una rutina específica con sus ejercicios vinculados
router.get('/:routineId', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const routine_id = parseInt(req.params.routineId);

    try {
        const results = await db
            .select({
                routineId: routines.routine_id,
                routineName: routines.name,
                routineDescription: routines.description,
                routineIsActive: routines.is_active,
                
                routineExerciseId: routineExercises.routine_exercise_id,
                exerciseId: exercises.exercise_id,
                exerciseName: exercises.name,
                exerciseNameEs: exercises.name_es,
                exerciseCategory: exercises.category,
                exerciseGifUrl: exercises.gif_url,
                exerciseVideoUrl: exercises.video_url,
                
                sets: routineExercises.sets,
                reps: routineExercises.reps,
                durationMinutes: routineExercises.duration_minutes,
                weightKg: routineExercises.weight_kg,
                orderIndex: routineExercises.order_index,
                dayOfWeek: routineExercises.day_of_week,
            })
            .from(routines)
            .leftJoin(routineExercises, eq(routineExercises.routine_id, routines.routine_id))
            .leftJoin(exercises, eq(routineExercises.exercise_id, exercises.exercise_id))
            .where(and(
                eq(routines.routine_id, routine_id),
                eq(routines.user_id, user_id)
            ))
            .orderBy(asc(routineExercises.day_of_week), asc(routineExercises.order_index));

        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Rutina no encontrada o no pertenece al usuario.' });
        }

        let routineData = null;
        let exercisesList = [];

        // Agrupación de resultados
        for (const row of results) {
            if (!routineData) {
                routineData = {
                    routine_id: row.routineId,
                    name: row.routineName,
                    description: row.routineDescription,
                    is_active: row.routineIsActive,
                    exercises: [] 
                };
            }
            
            if (row.exerciseId !== null) {
                exercisesList.push({
                    routine_exercise_id: row.routineExerciseId,
                    exercise_id: row.exerciseId,
                    name: row.exerciseNameEs || row.exerciseName, // Priorizar name_es si existe
                    name_es: row.exerciseNameEs,
                    category: row.exerciseCategory,
                    gif_url: row.exerciseGifUrl,
                    video_url: row.exerciseVideoUrl,
                    sets: row.sets,
                    reps: row.reps,
                    duration_minutes: row.durationMinutes,
                    weight_kg: row.weightKg,
                    order_index: row.orderIndex,
                    day_of_week: row.dayOfWeek,
                });
            }
        }

        if (routineData) {
             routineData.exercises = exercisesList;
        }

        return res.status(200).json({
            message: 'Rutina cargada con éxito, incluyendo ejercicios.',
            routine: routineData
        });

    } catch (error) {
        logger.error('Error al obtener la rutina y ejercicios:', { error: error.message, stack: error.stack, user_id, routine_id });
        return res.status(500).json({ error: 'Error interno del servidor al obtener la rutina.' });
    }
});


// 🚨 NUEVA RUTA 🚨
// --- RUTA: PUT /api/routines/:routineId ---
// 4. Actualizar el nombre o descripción de una rutina.
router.put('/:routineId', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const routine_id = parseInt(req.params.routineId);
    const { name, description } = req.body;

    // Solo se permite actualizar si se proporciona al menos uno de los campos
    if (!name && description === undefined) { 
        return res.status(400).json({ error: 'Se requiere al menos el nombre o la descripción para actualizar.' });
    }
    
    // Objeto con los campos a actualizar
    const updateFields = {};
    if (name) updateFields.name = name;
    // Si la descripción se envía (incluso si es null para borrarla), se incluye.
    if (description !== undefined) updateFields.description = description;

    try {
        // Actualizar solo si la rutina pertenece al usuario
        const updatedRoutine = await db.update(routines)
            .set(updateFields)
            .where(and(eq(routines.routine_id, routine_id), eq(routines.user_id, user_id)))
            .returning();

        if (updatedRoutine.length === 0) {
            return res.status(404).json({ error: 'Rutina no encontrada o no pertenece al usuario.' });
        }

        return res.status(200).json({
            message: 'Rutina actualizada con éxito.',
            routine: updatedRoutine[0]
        });

    } catch (error) {
        logger.error('Error al actualizar rutina:', { error: error.message, stack: error.stack, user_id, routine_id });
        return res.status(500).json({ error: 'Error interno del servidor al actualizar la rutina.' });
    }
});


// 🚨 NUEVA RUTA 🚨
// --- RUTA: DELETE /api/routines/:routineId ---
// 5. Eliminar (marcar como inactiva) una rutina.
router.delete('/:routineId', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const routine_id = parseInt(req.params.routineId);
    
    try {
        // Usamos .update() para marcar is_active=false (eliminación suave/soft delete)
        const deactivatedRoutine = await db.update(routines)
            .set({ is_active: false }) 
            .where(and(eq(routines.routine_id, routine_id), eq(routines.user_id, user_id)))
            .returning();

        if (deactivatedRoutine.length === 0) {
            // Si no se actualizó, es porque no existe o no pertenece al usuario
            return res.status(404).json({ error: 'Rutina no encontrada o no pertenece al usuario.' });
        }
        
        return res.status(200).json({
            message: 'Rutina desactivada (eliminada) con éxito.',
            routine_id: routine_id,
            new_status: 'inactive'
        });

    } catch (error) {
        logger.error('Error al desactivar rutina:', { error: error.message, stack: error.stack, user_id, routine_id });
        return res.status(500).json({ error: 'Error interno del servidor al desactivar la rutina.' });
    }
});


// --- RUTA: POST /api/routines/:routineId/exercises ---
// 6. Añadir un ejercicio a una rutina específica.
router.post('/:routineId/exercises', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const routine_id = parseInt(req.params.routineId);

    const { 
        exercise_id, 
        sets, 
        reps, 
        duration_minutes, 
        weight_kg, 
        order_index,
        day_of_week 
    } = req.body;

    if (!exercise_id || !sets || !order_index) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: exercise_id, sets y order_index.' });
    }

    try {
        const routineCheck = await db.select({ id: routines.routine_id })
            .from(routines)
            .where(and(eq(routines.routine_id, routine_id), eq(routines.user_id, user_id)));

        if (routineCheck.length === 0) {
            return res.status(404).json({ error: 'Rutina no encontrada o no pertenece al usuario.' });
        }

        const newRoutineExercise = await db.insert(routineExercises).values({
            routine_id: routine_id,
            exercise_id: exercise_id,
            sets: sets,
            reps: reps || null, 
            duration_minutes: duration_minutes || null,
            weight_kg: weight_kg || 0,
            order_index: order_index,
            day_of_week: day_of_week !== undefined && day_of_week !== null ? parseInt(day_of_week) : null,
        }).returning();

        return res.status(201).json({
            message: 'Ejercicio añadido a la rutina con éxito.',
            routineExercise: newRoutineExercise[0]
        });

    } catch (error) {
        if (error.code === '23505') { 
            return res.status(409).json({ error: 'Este ejercicio ya está agregado a esta rutina.' });
        }
        logger.error('Error al vincular ejercicio a rutina:', { error: error.message, stack: error.stack, user_id, routine_id });
        return res.status(500).json({ error: 'Error interno del servidor al añadir el ejercicio a la rutina.' });
    }
});


// 🚨 NUEVA RUTA 🚨
// --- RUTA: DELETE /api/routines/:routineId/exercises/:routineExerciseId ---
// 7. Quitar un ejercicio específico de una rutina (usando routine_exercise_id para manejar días diferentes)
router.delete('/:routineId/exercises/:routineExerciseId', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const routine_id = parseInt(req.params.routineId);
    const routine_exercise_id = parseInt(req.params.routineExerciseId);

    try {
        // 1. Verificar la propiedad de la rutina (para evitar eliminar registros en rutinas ajenas)
        const routineCheck = await db.select({ id: routines.routine_id })
            .from(routines)
            .where(and(eq(routines.routine_id, routine_id), eq(routines.user_id, user_id)));

        if (routineCheck.length === 0) {
            return res.status(404).json({ error: 'Rutina no encontrada o no pertenece al usuario.' });
        }
        
        // 2. Verificar que el routine_exercise_id pertenece a esta rutina
        const exerciseCheck = await db.select()
            .from(routineExercises)
            .where(and(
                eq(routineExercises.routine_exercise_id, routine_exercise_id),
                eq(routineExercises.routine_id, routine_id)
            ));

        if (exerciseCheck.length === 0) {
            return res.status(404).json({ error: 'El ejercicio no está vinculado a esta rutina.' });
        }
        
        // 3. Eliminar el registro específico en la tabla routine_exercises
        const deletedExercise = await db.delete(routineExercises)
            .where(eq(routineExercises.routine_exercise_id, routine_exercise_id))
            .returning(); // Devolver el registro eliminado

        if (deletedExercise.length === 0) {
            return res.status(404).json({ error: 'No se pudo eliminar el ejercicio.' });
        }

        return res.status(200).json({
            message: 'Ejercicio eliminado de la rutina con éxito.',
            deletedExercise: deletedExercise[0]
        });

    } catch (error) {
        logger.error('Error al eliminar ejercicio de la rutina:', { error: error.message, stack: error.stack, user_id, routine_id });
        return res.status(500).json({ error: 'Error interno del servidor al eliminar el ejercicio.' });
    }
});

// GET /api/routines/:routineId/export/pdf - Exportar rutina a PDF
router.get('/:routineId/export/pdf', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const routine_id = parseInt(req.params.routineId);

    try {
        // Obtener rutina con ejercicios (usar lógica existente de GET /:routineId)
        const results = await db
            .select({
                routineId: routines.routine_id,
                routineName: routines.name,
                routineDescription: routines.description,
                routineIsActive: routines.is_active,
                
                routineExerciseId: routineExercises.routine_exercise_id,
                exerciseId: exercises.exercise_id,
                exerciseName: exercises.name,
                exerciseNameEs: exercises.name_es,
                exerciseCategory: exercises.category,
                
                sets: routineExercises.sets,
                reps: routineExercises.reps,
                durationMinutes: routineExercises.duration_minutes,
                weightKg: routineExercises.weight_kg,
                orderIndex: routineExercises.order_index,
                dayOfWeek: routineExercises.day_of_week,
            })
            .from(routines)
            .leftJoin(routineExercises, eq(routineExercises.routine_id, routines.routine_id))
            .leftJoin(exercises, eq(routineExercises.exercise_id, exercises.exercise_id))
            .where(and(
                eq(routines.routine_id, routine_id),
                eq(routines.user_id, user_id)
            ))
            .orderBy(asc(routineExercises.day_of_week), asc(routineExercises.order_index));

        if (results.length === 0) {
            return res.status(404).json({ error: 'Rutina no encontrada o no pertenece al usuario.' });
        }

        let routineData = null;
        let exercisesList = [];

        // Agrupación de resultados
        for (const row of results) {
            if (!routineData) {
                routineData = {
                    routine_id: row.routineId,
                    name: row.routineName,
                    description: row.routineDescription,
                    is_active: row.routineIsActive,
                    exercises: []
                };
            }
            
            if (row.exerciseId !== null) {
                exercisesList.push({
                    routine_exercise_id: row.routineExerciseId,
                    exercise_id: row.exerciseId,
                    name: row.exerciseNameEs || row.exerciseName,
                    name_es: row.exerciseNameEs,
                    category: row.exerciseCategory,
                    sets: row.sets,
                    reps: row.reps,
                    duration_minutes: row.durationMinutes,
                    weight_kg: row.weightKg,
                    order_index: row.orderIndex,
                    day_of_week: row.dayOfWeek,
                });
            }
        }

        if (routineData) {
            routineData.exercises = exercisesList;
        }

        // Crear PDF
        const doc = new PDFDocument({
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            size: 'A4'
        });

        // Configurar headers para descarga
        const filename = `rutina_${routineData.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe PDF a response
        doc.pipe(res);

        // Título
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text(routineData.name, { align: 'center' });

        doc.moveDown();

        // Descripción
        if (routineData.description) {
            doc.fontSize(12)
               .font('Helvetica')
               .text(routineData.description, { align: 'center' });
            doc.moveDown();
        }

        doc.moveDown();

        // Agrupar ejercicios por día
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const exercisesByDay = {};
        const exercisesNoDay = [];

        exercisesList.forEach(ex => {
            if (ex.day_of_week !== null && ex.day_of_week !== undefined) {
                if (!exercisesByDay[ex.day_of_week]) {
                    exercisesByDay[ex.day_of_week] = [];
                }
                exercisesByDay[ex.day_of_week].push(ex);
            } else {
                exercisesNoDay.push(ex);
            }
        });

        // Ejercicios por día
        Object.keys(exercisesByDay).sort().forEach(day => {
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text(dayNames[parseInt(day)], { underline: true });
            doc.moveDown(0.5);

            exercisesByDay[day].forEach((ex, idx) => {
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .text(`${idx + 1}. ${ex.name}`, { indent: 20 });

                let details = `   Series: ${ex.sets}`;
                if (ex.reps) details += ` × ${ex.reps} repeticiones`;
                if (ex.duration_minutes) details += ` × ${ex.duration_minutes} minutos`;
                if (ex.weight_kg && parseFloat(ex.weight_kg) > 0) details += ` @ ${ex.weight_kg}kg`;

                doc.fontSize(10)
                   .font('Helvetica')
                   .text(details, { indent: 20 });
                doc.moveDown(0.3);
            });

            doc.moveDown();
        });

        // Ejercicios sin día específico
        if (exercisesNoDay.length > 0) {
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text('Ejercicios (todos los días)', { underline: true });
            doc.moveDown(0.5);

            exercisesNoDay.forEach((ex, idx) => {
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .text(`${idx + 1}. ${ex.name}`, { indent: 20 });

                let details = `   Series: ${ex.sets}`;
                if (ex.reps) details += ` × ${ex.reps} repeticiones`;
                if (ex.duration_minutes) details += ` × ${ex.duration_minutes} minutos`;
                if (ex.weight_kg && parseFloat(ex.weight_kg) > 0) details += ` @ ${ex.weight_kg}kg`;

                doc.fontSize(10)
                   .font('Helvetica')
                   .text(details, { indent: 20 });
                doc.moveDown(0.3);
            });
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('gray')
           .text(`Generado el ${new Date().toLocaleDateString('es-ES', { 
               year: 'numeric', 
               month: 'long', 
               day: 'numeric' 
           })}`, { align: 'center' });

        // Finalizar PDF
        doc.end();

    } catch (error) {
        logger.error('Error al generar PDF de rutina:', { error: error.message, stack: error.stack, user_id, routine_id });
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Error interno del servidor al generar el PDF.' });
        }
    }
}));

module.exports = router;