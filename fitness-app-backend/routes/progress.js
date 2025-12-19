// /routes/progress.js
// Rutas para seguimiento avanzado de progreso

const express = require('express');
const router = express.Router();
const authenticateToken = require('./authMiddleware');

const { db } = require('../db/db_config');
const schema = require('../db/schema');
const { users, dailyLogs, bodyMeasurements, progressPhotos, userGoals } = schema;
const { eq, and, desc, gte, lte, sql } = require('drizzle-orm');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/progress/measurements - Obtener medidas corporales
router.get('/measurements', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { start_date, end_date } = req.query;

    try {
        const conditions = [eq(bodyMeasurements.user_id, user_id)];
        
        if (start_date) {
            conditions.push(gte(bodyMeasurements.date, start_date));
        }
        if (end_date) {
            conditions.push(lte(bodyMeasurements.date, end_date));
        }

        const measurements = await db.select()
            .from(bodyMeasurements)
            .where(and(...conditions))
            .orderBy(desc(bodyMeasurements.date));

        return res.status(200).json({
            measurements,
        });

    } catch (error) {
        logger.error('Error al obtener medidas:', { error: error.message, stack: error.stack, user_id });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}));

// POST /api/progress/measurements - Crear o actualizar medida corporal
router.post('/measurements', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const {
        date,
        chest,
        waist,
        hips,
        arms,
        thighs,
        neck,
        shoulders,
        body_fat_percentage,
    } = req.body;

    if (!date) {
        return res.status(400).json({ error: 'La fecha es requerida.' });
    }

    try {
        // Verificar si ya existe una medida para esta fecha
        const existing = await db.select()
            .from(bodyMeasurements)
            .where(and(
                eq(bodyMeasurements.user_id, user_id),
                eq(bodyMeasurements.date, date)
            ))
            .limit(1);

        const measurementData = {
            user_id,
            date,
            chest: chest ? parseFloat(chest) : null,
            waist: waist ? parseFloat(waist) : null,
            hips: hips ? parseFloat(hips) : null,
            arms: arms ? parseFloat(arms) : null,
            thighs: thighs ? parseFloat(thighs) : null,
            neck: neck ? parseFloat(neck) : null,
            shoulders: shoulders ? parseFloat(shoulders) : null,
            body_fat_percentage: body_fat_percentage ? parseFloat(body_fat_percentage) : null,
            updated_at: new Date(),
        };

        let result;
        if (existing.length > 0) {
            // Actualizar
            result = await db.update(bodyMeasurements)
                .set(measurementData)
                .where(eq(bodyMeasurements.measurement_id, existing[0].measurement_id))
                .returning();
        } else {
            // Crear nuevo
            result = await db.insert(bodyMeasurements)
                .values(measurementData)
                .returning();
        }

        return res.status(existing.length > 0 ? 200 : 201).json({
            message: existing.length > 0 ? 'Medida actualizada exitosamente.' : 'Medida creada exitosamente.',
            measurement: result[0],
        });

    } catch (error) {
        logger.error('Error al guardar medida:', { error: error.message, stack: error.stack, user_id });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}));

// GET /api/progress/photos - Obtener fotos de progreso
router.get('/photos', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { start_date, end_date } = req.query;

    try {
        const conditions = [eq(progressPhotos.user_id, user_id)];
        
        if (start_date) {
            conditions.push(gte(progressPhotos.date, start_date));
        }
        if (end_date) {
            conditions.push(lte(progressPhotos.date, end_date));
        }

        const photos = await db.select()
            .from(progressPhotos)
            .where(and(...conditions))
            .orderBy(desc(progressPhotos.date));

        return res.status(200).json({
            photos,
        });

    } catch (error) {
        logger.error('Error al obtener fotos:', { error: error.message, stack: error.stack, user_id });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}));

// POST /api/progress/photos - Crear o actualizar foto de progreso
router.post('/photos', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const {
        date,
        photo_front,
        photo_side,
        photo_back,
        weight,
        notes,
    } = req.body;

    if (!date) {
        return res.status(400).json({ error: 'La fecha es requerida.' });
    }

    try {
        // Verificar si ya existe una foto para esta fecha
        const existing = await db.select()
            .from(progressPhotos)
            .where(and(
                eq(progressPhotos.user_id, user_id),
                eq(progressPhotos.date, date)
            ))
            .limit(1);

        const photoData = {
            user_id,
            date,
            photo_front: photo_front || null,
            photo_side: photo_side || null,
            photo_back: photo_back || null,
            weight: weight ? parseFloat(weight) : null,
            notes: notes || null,
            updated_at: new Date(),
        };

        let result;
        if (existing.length > 0) {
            // Actualizar
            result = await db.update(progressPhotos)
                .set(photoData)
                .where(eq(progressPhotos.photo_id, existing[0].photo_id))
                .returning();
        } else {
            // Crear nuevo
            result = await db.insert(progressPhotos)
                .values(photoData)
                .returning();
        }

        return res.status(existing.length > 0 ? 200 : 201).json({
            message: existing.length > 0 ? 'Foto actualizada exitosamente.' : 'Foto creada exitosamente.',
            photo: result[0],
        });

    } catch (error) {
        logger.error('Error al guardar foto:', { error: error.message, stack: error.stack, user_id });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}));

// GET /api/progress/analytics - Análisis avanzado de progreso
router.get('/analytics', authenticateToken, asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { period = 30 } = req.query; // Días a analizar

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Obtener objetivo activo
        const goal = await db.select()
            .from(userGoals)
            .where(and(
                eq(userGoals.user_id, user_id),
                eq(userGoals.is_active, true)
            ))
            .limit(1);

        // Obtener peso inicial y final
        const weightLogs = await db.select()
            .from(dailyLogs)
            .where(and(
                eq(dailyLogs.user_id, user_id),
                gte(dailyLogs.date, startDateStr),
                lte(dailyLogs.date, endDateStr),
                sql`${dailyLogs.weight} > 0`
            ))
            .orderBy(dailyLogs.date);

        // Obtener medidas corporales
        const measurements = await db.select()
            .from(bodyMeasurements)
            .where(and(
                eq(bodyMeasurements.user_id, user_id),
                gte(bodyMeasurements.date, startDateStr),
                lte(bodyMeasurements.date, endDateStr)
            ))
            .orderBy(bodyMeasurements.date);

        // Calcular análisis
        const analysis = {
            weight: {
                start: weightLogs.length > 0 ? parseFloat(weightLogs[0].weight) : null,
                end: weightLogs.length > 0 ? parseFloat(weightLogs[weightLogs.length - 1].weight) : null,
                change: weightLogs.length > 1 
                    ? parseFloat(weightLogs[weightLogs.length - 1].weight) - parseFloat(weightLogs[0].weight)
                    : null,
                trend: weightLogs.length > 1 ? (() => {
                    const first = parseFloat(weightLogs[0].weight);
                    const last = parseFloat(weightLogs[weightLogs.length - 1].weight);
                    return last < first ? 'decreasing' : last > first ? 'increasing' : 'stable';
                })() : null,
            },
            measurements: measurements.length > 0 ? {
                chest: {
                    start: parseFloat(measurements[0].chest) || null,
                    end: parseFloat(measurements[measurements.length - 1].chest) || null,
                    change: measurements.length > 1 && measurements[0].chest && measurements[measurements.length - 1].chest
                        ? parseFloat(measurements[measurements.length - 1].chest) - parseFloat(measurements[0].chest)
                        : null,
                },
                waist: {
                    start: parseFloat(measurements[0].waist) || null,
                    end: parseFloat(measurements[measurements.length - 1].waist) || null,
                    change: measurements.length > 1 && measurements[0].waist && measurements[measurements.length - 1].waist
                        ? parseFloat(measurements[measurements.length - 1].waist) - parseFloat(measurements[0].waist)
                        : null,
                },
                hips: {
                    start: parseFloat(measurements[0].hips) || null,
                    end: parseFloat(measurements[measurements.length - 1].hips) || null,
                    change: measurements.length > 1 && measurements[0].hips && measurements[measurements.length - 1].hips
                        ? parseFloat(measurements[measurements.length - 1].hips) - parseFloat(measurements[0].hips)
                        : null,
                },
            } : null,
            projection: null,
        };

        // Calcular proyección hacia el objetivo
        if (goal.length > 0 && weightLogs.length > 1) {
            const g = goal[0];
            const currentWeight = parseFloat(weightLogs[weightLogs.length - 1].weight);
            const targetWeight = parseFloat(g.target_weight);
            const weightChange = analysis.weight.change;
            
            if (weightChange !== null && weightChange !== 0) {
                const daysElapsed = weightLogs.length;
                const ratePerDay = weightChange / daysElapsed;
                const remainingWeight = targetWeight - currentWeight;
                const daysToGoal = Math.abs(remainingWeight / ratePerDay);
                
                analysis.projection = {
                    currentWeight,
                    targetWeight,
                    daysToGoal: Math.round(daysToGoal),
                    estimatedDate: new Date(Date.now() + daysToGoal * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    ratePerWeek: Math.abs(ratePerDay * 7),
                };
            }
        }

        return res.status(200).json({
            period,
            startDate: startDateStr,
            endDate: endDateStr,
            analysis,
        });

    } catch (error) {
        logger.error('Error al calcular análisis:', { error: error.message, stack: error.stack, user_id });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}));

module.exports = router;

