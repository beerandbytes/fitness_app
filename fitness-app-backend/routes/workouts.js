// /routes/workouts.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('./authMiddleware');
const { db } = require('../db/db_config');
const schema = require('../db/schema');
const { dailyLogs, dailyExercises, exercises } = schema;
const { eq, and, desc, count, gte, lte } = require('drizzle-orm');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');
const { routeValidations, handleValidationErrors, commonValidations } = require('../middleware/validation');

// Helper para obtener o crear log por fecha
async function getOrCreateDailyLogByDate(user_id, date) {
    const existing = await db.select({ id: dailyLogs.log_id })
        .from(dailyLogs)
        .where(and(eq(dailyLogs.user_id, user_id), eq(dailyLogs.date, date)));
    if (existing.length > 0) return existing[0].id;
    
    const newLog = await db.insert(dailyLogs).values({
        user_id,
        date,
        weight: 0, // Se debe actualizar después
        consumed_calories: 0,
        burned_calories: 0,
    }).returning({ id: dailyLogs.log_id });
    return newLog[0].id;
}

// Helper: obtain today's log or create it
async function getOrCreateDailyLog(user_id) {
    const today = new Date().toISOString().split('T')[0]; // YYYY‑MM‑DD
    const existing = await db.select({ id: dailyLogs.log_id })
        .from(dailyLogs)
        .where(and(eq(dailyLogs.user_id, user_id), eq(dailyLogs.date, today)));
    if (existing.length > 0) return existing[0].id;
    const newLog = await db.insert(dailyLogs).values({
        user_id,
        date: today,
        weight: 0,
        consumed_calories: 0,
        burned_calories: 0,
    }).returning({ id: dailyLogs.log_id });
    return newLog[0].id;
}

// GET /api/workouts – obtener historial de entrenamientos con paginación
router.get('/',
    authenticateToken,
    commonValidations.pagination,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const user_id = req.user.id;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;
        
        // Filtros opcionales
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;
        const exerciseId = req.query.exercise_id ? parseInt(req.query.exercise_id) : null;

        // Construir condiciones where
        const conditions = [eq(dailyLogs.user_id, user_id)];
        
        if (startDate) {
            conditions.push(gte(dailyLogs.date, startDate));
        }
        if (endDate) {
            conditions.push(lte(dailyLogs.date, endDate));
        }
        if (exerciseId) {
            conditions.push(eq(dailyExercises.exercise_id, exerciseId));
        }

        // Obtener total de logs con ejercicios
        const totalResult = await db.select({ count: count() })
            .from(dailyLogs)
            .innerJoin(dailyExercises, eq(dailyLogs.log_id, dailyExercises.log_id))
            .where(and(...conditions));

        const total = totalResult[0]?.count || 0;

        // Obtener workouts con paginación
        const workouts = await db.select({
            log_id: dailyLogs.log_id,
            date: dailyLogs.date,
            burned_calories: dailyLogs.burned_calories,
            exercise_id: dailyExercises.exercise_id,
            exercise_name: exercises.name,
            sets_done: dailyExercises.sets_done,
            reps_done: dailyExercises.reps_done,
            duration_minutes: dailyExercises.duration_minutes,
            weight_kg: dailyExercises.weight_kg,
            burned_calories_exercise: dailyExercises.burned_calories,
            created_at: dailyExercises.created_at,
        })
        .from(dailyLogs)
        .innerJoin(dailyExercises, eq(dailyLogs.log_id, dailyExercises.log_id))
        .innerJoin(exercises, eq(dailyExercises.exercise_id, exercises.exercise_id))
        .where(and(...conditions))
        .orderBy(desc(dailyLogs.date), desc(dailyExercises.created_at))
        .limit(limit)
        .offset(offset);

        return res.status(200).json({
            workouts: workouts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    })
);

// POST /api/workouts/log – register a completed exercise for today
router.post('/log', 
    authenticateToken,
    routeValidations.logWorkout || ((req, res, next) => next()), // Validación si existe
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const user_id = req.user.id;
        const {
            exercise_id,
            sets_done,
            reps_done,
            duration_minutes,
            weight_kg,
            burned_calories,
        } = req.body;

        if (!exercise_id || !sets_done || burned_calories === undefined) {
            return res.status(400).json({ error: 'exercise_id, sets_done y burned_calories son obligatorios.' });
        }

        const log_id = await getOrCreateDailyLog(user_id);
        
        // Insertar el ejercicio
        const newEntry = await db.insert(dailyExercises).values({
            log_id,
            exercise_id,
            sets_done,
            reps_done: reps_done || null,
            duration_minutes: duration_minutes || null,
            weight_kg: weight_kg || 0,
            burned_calories,
        }).returning();

        // Actualizar el total de calorías quemadas en el log diario
        const allDailyExercises = await db.select({
            burned_calories: dailyExercises.burned_calories
        })
        .from(dailyExercises)
        .where(eq(dailyExercises.log_id, log_id));

        const totalBurned = allDailyExercises.reduce((sum, ex) => {
            return sum + parseFloat(ex.burned_calories || 0);
        }, 0);

        await db.update(dailyLogs)
            .set({
                burned_calories: totalBurned.toFixed(2),
                updated_at: new Date()
            })
            .where(eq(dailyLogs.log_id, log_id));

        return res.status(201).json({
            message: 'Ejercicio registrado en el log diario.',
            dailyExercise: newEntry[0],
        });
    })
);

module.exports = router;
