// /utils/recommendationEngine.js
// Motor de recomendaciones basado en IA/ML

const logger = require('./logger');

/**
 * Analiza patrones de entrenamiento del usuario
 * @param {Array} workoutHistory - Historial de entrenamientos
 * @returns {Object} Patrones identificados
 */
function analyzeTrainingPatterns(workoutHistory) {
    if (!workoutHistory || workoutHistory.length === 0) {
        return null;
    }

    // Agrupar por día de la semana
    const dayOfWeekCounts = {};
    const exerciseFrequency = {};
    const averageWeights = {};
    const timeOfDay = { morning: 0, afternoon: 0, evening: 0 };

    workoutHistory.forEach(workout => {
        const date = new Date(workout.date);
        const dayOfWeek = date.getDay();
        dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;

        const hour = date.getHours();
        if (hour < 12) timeOfDay.morning++;
        else if (hour < 18) timeOfDay.afternoon++;
        else timeOfDay.evening++;

        if (workout.exercise_name) {
            exerciseFrequency[workout.exercise_name] = (exerciseFrequency[workout.exercise_name] || 0) + 1;
        }

        if (workout.weight_kg && workout.exercise_name) {
            if (!averageWeights[workout.exercise_name]) {
                averageWeights[workout.exercise_name] = { total: 0, count: 0 };
            }
            averageWeights[workout.exercise_name].total += parseFloat(workout.weight_kg);
            averageWeights[workout.exercise_name].count++;
        }
    });

    // Calcular día más común
    const mostCommonDay = Object.entries(dayOfWeekCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Calcular ejercicio más frecuente
    const mostFrequentExercise = Object.entries(exerciseFrequency)
        .sort((a, b) => b[1] - a[1])[0];

    // Calcular pesos promedios
    const avgWeights = {};
    Object.entries(averageWeights).forEach(([exercise, data]) => {
        avgWeights[exercise] = data.total / data.count;
    });

    // Calcular mejor momento del día
    const bestTimeOfDay = Object.entries(timeOfDay)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
        mostCommonDay: mostCommonDay ? parseInt(mostCommonDay) : null,
        mostFrequentExercise: mostFrequentExercise?.[0] || null,
        exerciseFrequency: exerciseFrequency,
        averageWeights: avgWeights,
        preferredTimeOfDay: bestTimeOfDay,
        totalWorkouts: workoutHistory.length,
    };
}

/**
 * Sugiere peso basado en historial
 * @param {Object} exerciseHistory - Historial de un ejercicio específico
 * @param {Number} currentWeight - Peso actual usado
 * @returns {Number} Peso sugerido
 */
function suggestWeight(exerciseHistory, currentWeight) {
    if (!exerciseHistory || exerciseHistory.length === 0) {
        return currentWeight || null;
    }

    // Analizar progresión
    const recentWorkouts = exerciseHistory.slice(0, 5); // Últimos 5 entrenamientos
    const weights = recentWorkouts
        .map(w => parseFloat(w.weight_kg))
        .filter(w => w > 0);

    if (weights.length === 0) {
        return currentWeight || null;
    }

    // Calcular promedio y tendencia
    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const lastWeight = weights[0];
    
    // Si el usuario completó todas las series consistentemente, sugerir incremento
    const completedSets = recentWorkouts.filter(w => 
        w.sets_done >= w.sets_planned && w.sets_planned > 0
    ).length;

    if (completedSets >= 3 && lastWeight === weights[0]) {
        // Sugerir incremento del 5-10%
        return Math.round((lastWeight * 1.05) * 2) / 2; // Redondear a 0.5kg
    }

    return lastWeight;
}

/**
 * Predice días más probables para entrenar
 * @param {Object} patterns - Patrones de entrenamiento
 * @returns {Array} Días sugeridos
 */
function predictTrainingDays(patterns) {
    if (!patterns || !patterns.mostCommonDay) {
        // Si no hay patrón claro, sugerir días comunes
        return [1, 3, 5]; // Lunes, Miércoles, Viernes
    }

    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const commonDay = patterns.mostCommonDay;
    
    // Sugerir el día más común y días alternos
    const suggestions = [commonDay];
    if (commonDay < 6) suggestions.push(commonDay + 2);
    if (commonDay > 0) suggestions.push(commonDay - 2);

    return suggestions.filter(d => d >= 0 && d <= 6);
}

/**
 * Ajusta calorías basado en actividad real
 * @param {Number} baseCalories - Calorías base
 * @param {Object} activityData - Datos de actividad reciente
 * @returns {Number} Calorías ajustadas
 */
function adjustCaloriesBasedOnActivity(baseCalories, activityData) {
    if (!activityData || !activityData.recentBurned) {
        return baseCalories;
    }

    // Si el usuario quema más calorías de las esperadas, ajustar objetivo
    const expectedDailyBurn = 200; // Calorías esperadas por día
    const actualAvgBurn = activityData.recentBurned / (activityData.daysTracked || 1);
    
    if (actualAvgBurn > expectedDailyBurn * 1.2) {
        // Usuario muy activo, aumentar 200 kcal
        return baseCalories + 200;
    } else if (actualAvgBurn < expectedDailyBurn * 0.8) {
        // Usuario menos activo, reducir 100 kcal
        return Math.max(baseCalories - 100, 1200); // Mínimo 1200 kcal
    }

    return baseCalories;
}

/**
 * Genera recomendaciones personalizadas
 * @param {Object} userData - Datos del usuario
 * @param {Array} workoutHistory - Historial de entrenamientos
 * @param {Object} currentGoal - Objetivo actual
 * @returns {Object} Recomendaciones
 */
function generateRecommendations(userData, workoutHistory, currentGoal) {
    const patterns = analyzeTrainingPatterns(workoutHistory);
    
    const recommendations = {
        suggestedTrainingDays: predictTrainingDays(patterns),
        preferredTimeOfDay: patterns?.preferredTimeOfDay || 'afternoon',
        mostEffectiveExercises: patterns ? 
            Object.entries(patterns.exerciseFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name]) => name)
            : [],
        patterns: patterns,
        suggestions: [],
    };

    // Sugerencias basadas en patrones
    if (patterns) {
        if (patterns.totalWorkouts < 3) {
            recommendations.suggestions.push({
                type: 'frequency',
                message: 'Intenta entrenar al menos 3 veces por semana para mejores resultados',
                priority: 'high',
            });
        }

        if (patterns.preferredTimeOfDay) {
            recommendations.suggestions.push({
                type: 'timing',
                message: `Tu mejor momento para entrenar es por la ${patterns.preferredTimeOfDay === 'morning' ? 'mañana' : patterns.preferredTimeOfDay === 'afternoon' ? 'tarde' : 'noche'}`,
                priority: 'low',
            });
        }

        if (patterns.mostCommonDay !== null) {
            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            recommendations.suggestions.push({
                type: 'schedule',
                message: `Tu día más consistente para entrenar es ${dayNames[patterns.mostCommonDay]}`,
                priority: 'medium',
            });
        }
    }

    return recommendations;
}

module.exports = {
    analyzeTrainingPatterns,
    suggestWeight,
    predictTrainingDays,
    adjustCaloriesBasedOnActivity,
    generateRecommendations,
};

