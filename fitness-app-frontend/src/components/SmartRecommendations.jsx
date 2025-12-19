import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import logger from '../utils/logger';
import Icon from './Icons';

/**
 * Componente de recomendaciones inteligentes para el dashboard
 * Muestra próxima acción sugerida y insights contextuales
 */
const SmartRecommendations = ({ goal, log, mealItems }) => {
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                
                // Analizar estado actual y generar recomendaciones
                const currentHour = new Date().getHours();
                const hasMealsToday = mealItems && mealItems.length > 0;
                const caloriesConsumed = log ? parseFloat(log.consumed_calories) : 0;
                const calorieGoal = goal && goal.daily_calorie_goal ? parseFloat(goal.daily_calorie_goal) : 2000;
                const hasWorkoutToday = log ? parseFloat(log.burned_calories) > 0 : false;
                const currentWeight = log ? parseFloat(log.weight) : null;
                const targetWeight = goal ? parseFloat(goal.target_weight) : null;

                const newRecommendations = [];

                // Recomendación de próxima acción
                let nextAction = null;
                let nextActionIcon = 'target';
                let nextActionPath = '/dashboard';

                // Lógica de recomendaciones basada en contexto
                if (!hasMealsToday && currentHour >= 8 && currentHour < 10) {
                    nextAction = {
                        title: 'Registra tu desayuno',
                        description: 'Es hora de empezar el día con energía',
                        icon: 'food',
                        path: '/diet',
                        priority: 'high',
                    };
                } else if (!hasMealsToday && currentHour >= 13 && currentHour < 15) {
                    nextAction = {
                        title: 'Añade tu almuerzo',
                        description: 'Mantén tu registro nutricional actualizado',
                        icon: 'food',
                        path: '/diet',
                        priority: 'high',
                    };
                } else if (!hasWorkoutToday && currentHour >= 17 && currentHour < 21) {
                    nextAction = {
                        title: 'Realiza tu entrenamiento',
                        description: 'El mejor momento para entrenar',
                        icon: 'workout',
                        path: '/routines',
                        priority: 'high',
                    };
                } else if (!currentWeight || !log) {
                    nextAction = {
                        title: 'Registra tu peso',
                        description: 'Comienza a seguir tu progreso',
                        icon: 'scale',
                        path: '/weight',
                        priority: 'medium',
                    };
                } else if (!goal) {
                    nextAction = {
                        title: 'Establece tu objetivo',
                        description: 'Define tus metas para un mejor seguimiento',
                        icon: 'target',
                        path: '/dashboard',
                        priority: 'medium',
                    };
                } else if (caloriesConsumed < calorieGoal * 0.5 && currentHour >= 14) {
                    nextAction = {
                        title: 'Continúa con tu alimentación',
                        description: `Te quedan ${Math.round(calorieGoal - caloriesConsumed)} kcal para alcanzar tu objetivo`,
                        icon: 'food',
                        path: '/diet',
                        priority: 'medium',
                    };
                } else {
                    nextAction = {
                        title: 'Todo bajo control',
                        description: '¡Sigue así! Estás haciendo un gran trabajo',
                        icon: 'achievement',
                        path: '/dashboard',
                        priority: 'low',
                    };
                }

                // Insights contextuales
                const newInsights = [];

                // Insight de progreso de peso
                if (currentWeight && targetWeight) {
                    const diff = targetWeight - currentWeight;
                    const percentComplete = goal.goal_type === 'weight_loss' 
                        ? ((currentWeight - targetWeight) / (parseFloat(goal.current_weight) - targetWeight)) * 100
                        : ((targetWeight - currentWeight) / (targetWeight - parseFloat(goal.current_weight))) * 100;
                    
                    if (Math.abs(diff) > 0.5) {
                        const isProgressing = goal.goal_type === 'weight_loss' ? diff > 0 : diff < 0;
                        if (percentComplete > 0 && percentComplete < 100) {
                            newInsights.push({
                                type: 'progress',
                                title: isProgressing ? '¡Vas por buen camino!' : 'Mantén el ritmo',
                                description: goal.goal_type === 'weight_loss'
                                    ? `Has perdido ${Math.abs(parseFloat(goal.current_weight) - currentWeight).toFixed(1)}kg. ¡Sigue así!`
                                    : `Has ganado ${Math.abs(currentWeight - parseFloat(goal.current_weight)).toFixed(1)}kg. ¡Excelente progreso!`,
                                icon: 'trendUp',
                                color: isProgressing ? 'green' : 'blue',
                            });
                        }
                    }
                }

                // Insight de calorías
                if (calorieGoal && caloriesConsumed > 0) {
                    const percentConsumed = (caloriesConsumed / calorieGoal) * 100;
                    if (percentConsumed > 80 && percentConsumed < 100) {
                        newInsights.push({
                            type: 'calories',
                            title: 'Casi alcanzaste tu objetivo',
                            description: `Has consumido ${Math.round(caloriesConsumed)} de ${Math.round(calorieGoal)} kcal`,
                            icon: 'target',
                            color: 'blue',
                        });
                    } else if (percentConsumed >= 100) {
                        newInsights.push({
                            type: 'calories',
                            title: '¡Objetivo alcanzado! 🎉',
                            description: `Has alcanzado tu meta de ${Math.round(calorieGoal)} kcal`,
                            icon: 'achievement',
                            color: 'green',
                        });
                    }
                }

                // Insight de consistencia
                if (hasMealsToday && hasWorkoutToday) {
                    newInsights.push({
                        type: 'consistency',
                        title: 'Día completo',
                        description: 'Has registrado comidas y entrenamiento. ¡Excelente!',
                        icon: 'achievement',
                        color: 'green',
                    });
                }

                setRecommendation(nextAction);
                setInsights(newInsights);
            } catch (error) {
                logger.error('Error al obtener recomendaciones:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [goal, log, mealItems]);

    if (loading || !recommendation) {
        return null;
    }

    const priorityColors = {
        high: 'from-red-500 to-orange-500',
        medium: 'from-blue-500 to-indigo-500',
        low: 'from-green-500 to-emerald-500',
    };

    const iconColors = {
        green: 'text-green-600 dark:text-green-400',
        blue: 'text-blue-600 dark:text-blue-400',
        orange: 'text-orange-600 dark:text-orange-400',
    };

    return (
        <div className="space-y-4">
            {/* Próxima Acción */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-r ${priorityColors[recommendation.priority]} rounded-3xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all`}
                onClick={() => navigate(recommendation.path)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Icon name={recommendation.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="text-white/90 text-xs font-medium mb-1">PRÓXIMA ACCIÓN</div>
                        <h3 className="text-white font-bold text-lg mb-1">{recommendation.title}</h3>
                        <p className="text-white/80 text-sm">{recommendation.description}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </motion.div>

            {/* Insight Cards */}
            <AnimatePresence>
                {insights.length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                        {insights.map((insight, index) => (
                            <motion.div
                                key={`${insight.type}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-${insight.color}-100 dark:bg-${insight.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                                        <Icon name={insight.icon} className={`w-5 h-5 ${iconColors[insight.color]}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                            {insight.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {insight.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmartRecommendations;

