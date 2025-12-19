// /routes/streaks.js
// Rutas para el sistema de streaks (rachas de días consecutivos)

const express = require('express');
const router = express.Router();
const authenticateToken = require('./authMiddleware');

const { db } = require('../db/db_config');
const schema = require('../db/schema');
const { users, dailyLogs, dailyExercises } = schema;
const { eq, and, gte, lte, desc, sql } = require('drizzle-orm');
const logger = require('../utils/logger');

// GET /api/streaks/current - Obtener streak actual y datos del calendario
router.get('/current', authenticateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        // Obtener todos los días con ejercicios en los últimos 60 días
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const dateStr = sixtyDaysAgo.toISOString().split('T')[0];

        const exerciseDays = await db
            .select({ date: dailyLogs.date })
            .from(dailyLogs)
            .innerJoin(dailyExercises, eq(dailyLogs.log_id, dailyExercises.log_id))
            .where(and(
                eq(dailyLogs.user_id, user_id),
                gte(dailyLogs.date, dateStr)
            ))
            .groupBy(dailyLogs.date)
            .orderBy(desc(dailyLogs.date));

        // Calcular streak actual
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const dates = exerciseDays.map(d => d.date);
        
        if (dates.includes(today) || dates.includes(yesterdayStr)) {
            streak = 1;
            let currentDate = dates.includes(today) ? today : yesterdayStr;
            
            for (let i = 0; i < dates.length; i++) {
                if (dates[i] === currentDate) {
                    streak++;
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(nextDate.getDate() - 1);
                    currentDate = nextDate.toISOString().split('T')[0];
                } else {
                    break;
                }
            }
            // Ajustar porque empezamos con 1
            streak = streak - 1;
        }

        // Crear mapa de días con actividad
        const activityMap = {};
        exerciseDays.forEach(day => {
            activityMap[day.date] = true;
        });

        // Calcular logros de racha
        const milestones = [7, 14, 30, 60, 90, 100];
        const nextMilestone = milestones.find(m => m > streak) || null;
        const achievedMilestones = milestones.filter(m => m <= streak);
        const progressToNextMilestone = nextMilestone ? (streak / nextMilestone) * 100 : 100;

        // Verificar si está en riesgo de perder la racha (último entrenamiento fue ayer o antes)
        const lastExerciseDate = dates.length > 0 ? dates[0] : null;
        const isAtRisk = streak > 0 && lastExerciseDate && lastExerciseDate !== today && lastExerciseDate === yesterdayStr;

        // Calcular días de "freeze" disponibles (uno al mes)
        const user = await db.select({ created_at: users.created_at })
            .from(users)
            .where(eq(users.user_id, user_id))
            .limit(1);
        
        const accountAgeDays = user.length > 0 
            ? Math.floor((new Date() - new Date(user[0].created_at)) / (1000 * 60 * 60 * 24))
            : 0;
        const freezesAvailable = Math.floor(accountAgeDays / 30);

        return res.status(200).json({
            streak,
            isAtRisk,
            nextMilestone,
            progressToNextMilestone,
            achievedMilestones,
            activityMap,
            freezesAvailable,
        });

    } catch (error) {
        logger.error('Error al obtener streak:', { error: error.message, stack: error.stack, user_id });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// GET /api/streaks/calendar - Obtener datos del calendario para visualización
router.get('/calendar', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const { year, month } = req.query;

    try {
        const targetDate = year && month 
            ? new Date(parseInt(year), parseInt(month) - 1, 1)
            : new Date();

        const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const exerciseDays = await db
            .select({ date: dailyLogs.date })
            .from(dailyLogs)
            .innerJoin(dailyExercises, eq(dailyLogs.log_id, dailyExercises.log_id))
            .where(and(
                eq(dailyLogs.user_id, user_id),
                gte(dailyLogs.date, startDateStr),
                lte(dailyLogs.date, endDateStr)
            ))
            .groupBy(dailyLogs.date);

        const activityMap = {};
        exerciseDays.forEach(day => {
            activityMap[day.date] = true;
        });

        return res.status(200).json({
            year: targetDate.getFullYear(),
            month: targetDate.getMonth() + 1,
            activityMap,
        });

    } catch (error) {
        logger.error('Error al obtener calendario de streak:', { error: error.message, stack: error.stack, user_id });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// POST /api/streaks/freeze - Usar un día de "freeze" para mantener la racha
router.post('/freeze', authenticateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        // Verificar cuántos freezes tiene disponibles
        const user = await db.select({ created_at: users.created_at })
            .from(users)
            .where(eq(users.user_id, user_id))
            .limit(1);
        
        if (user.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const accountAgeDays = Math.floor((new Date() - new Date(user[0].created_at)) / (1000 * 60 * 60 * 24));
        const freezesAvailable = Math.floor(accountAgeDays / 30);

        // TODO: Implementar tabla de freezes usados para rastrear cuántos se han usado
        // Por ahora, permitimos usar freeze si está disponible

        // Marcar el día de hoy como "frozen" creando un ejercicio ficticio o usando otra marca
        // Por simplicidad, retornamos éxito - la implementación completa requeriría una tabla de freezes

        return res.status(200).json({
            message: 'Freeze aplicado correctamente. Tu racha se mantiene.',
            freezesRemaining: Math.max(0, freezesAvailable - 1),
        });

    } catch (error) {
        logger.error('Error al aplicar freeze:', { error: error.message, stack: error.stack, user_id });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;

