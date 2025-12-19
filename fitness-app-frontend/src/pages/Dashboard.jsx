import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import ModernNavbar from '../components/ModernNavbar';
import BottomNavigation from '../components/BottomNavigation';
import CalorieRadialChart from '../components/CalorieRadialChart';
import MacroBarChart from '../components/MacroBarChart';
import WeeklyStatsWidget from '../components/WeeklyStatsWidget';
import GoalManager from '../components/GoalManager';
import FirstStepsGuide from '../components/FirstStepsGuide';
import SmartRecommendations from '../components/SmartRecommendations';
import StreakTracker from '../components/StreakTracker';
import MotivationWidget from '../components/MotivationWidget';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { DashboardPageSkeleton } from '../components/DashboardPageSkeleton';
import EnhancedInteractiveTour from '../components/EnhancedInteractiveTour';
import Icon from '../components/Icons';
import { format, subDays, subWeeks } from 'date-fns';
import api from '../services/api';
import logger from '../utils/logger';
import { motion } from 'framer-motion';

// Lazy load de componentes pesados
const WeightLineChart = lazy(() => import('../components/WeightLineChart'));

// Skeleton para WeightLineChart
const WeightChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
); 

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [log, setLog] = useState(null); 
    const [mealItems, setMealItems] = useState([]);
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weeklyComparison, setWeeklyComparison] = useState(null);
    const [monthlyProgress, setMonthlyProgress] = useState(null);
    const [streak, setStreak] = useState(0);
    
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    
    const fetchDailyLog = useCallback(async () => {
        try {
            const response = await api.get(`/logs/${formattedDate}`);
            setLog(response.data.log); 
            setMealItems(response.data.mealItems || []);
        } catch (err) {
            logger.error('Error al cargar log diario:', err);
        }
    }, [formattedDate]);

    const fetchGoal = useCallback(async () => {
        try {
            const response = await api.get('/goals');
            if (response.data.goal) {
                setGoal(response.data.goal);
            } else {
                setGoal(null);
            }
        } catch (error) {
            logger.error('Error al cargar objetivo:', error);
            setGoal(null);
        }
    }, []);

    // Fetch comparaciones semanales y mensuales
    const fetchComparisons = useCallback(async () => {
        try {
            const weekAgo = format(subDays(currentDate, 7), 'yyyy-MM-dd');
            const monthAgo = format(subDays(currentDate, 30), 'yyyy-MM-dd');

            // Obtener datos de la semana pasada
            try {
                const weekAgoResponse = await api.get(`/logs/${weekAgo}`);
                const weekAgoLog = weekAgoResponse.data.log;
                
                if (weekAgoLog && log) {
                    const weightDiff = parseFloat(log.weight) - parseFloat(weekAgoLog.weight);
                    const caloriesDiff = parseFloat(log.consumed_calories) - parseFloat(weekAgoLog.consumed_calories);
                    
                    setWeeklyComparison({
                        weightDiff,
                        caloriesDiff,
                        hasData: true,
                    });
                }
            } catch (err) {
                // No hay datos, está bien
            }

            // Obtener datos del mes pasado para progreso
            try {
                const monthAgoResponse = await api.get(`/logs/${monthAgo}`);
                const monthAgoLog = monthAgoResponse.data.log;
                
                if (monthAgoLog && log && goal) {
                    const currentWeight = parseFloat(log.weight);
                    const monthAgoWeight = parseFloat(monthAgoLog.weight);
                    const targetWeight = parseFloat(goal.target_weight);
                    const startWeight = parseFloat(goal.current_weight);
                    
                    const totalProgress = goal.goal_type === 'weight_loss'
                        ? (startWeight - currentWeight) / (startWeight - targetWeight) * 100
                        : (currentWeight - startWeight) / (targetWeight - startWeight) * 100;
                    
                    const monthlyProgressValue = goal.goal_type === 'weight_loss'
                        ? startWeight - currentWeight
                        : currentWeight - startWeight;

                    setMonthlyProgress({
                        totalProgress: Math.max(0, Math.min(100, totalProgress)),
                        monthlyChange: currentWeight - monthAgoWeight,
                        monthlyProgress: monthlyProgressValue,
                        hasData: true,
                    });
                }
            } catch (err) {
                // No hay datos, está bien
            }
        } catch (error) {
            logger.error('Error al obtener comparaciones:', error);
        }
    }, [currentDate, log, goal]);

    // Fetch streak
    const fetchStreak = useCallback(async () => {
        try {
            const response = await api.get('/streaks/current');
            setStreak(response.data.streak || 0);
        } catch (error) {
            logger.error('Error al cargar streak:', error);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchDailyLog(), fetchGoal(), fetchStreak()]);
            setLoading(false);
        };
        loadData();
    }, [fetchDailyLog, fetchGoal, fetchStreak]);

    useEffect(() => {
        if (log && goal) {
            fetchComparisons();
        }
        // fetchComparisons está memoizado con useCallback y sus dependencias son estables
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [log, goal]); // Removido fetchComparisons de dependencias para evitar bucles

    const totalMacros = mealItems.reduce((acc, item) => {
        if (!item || !item.food) return acc;
        const quantity = parseFloat(item.quantity_grams) || 0;
        const food = item.food;
        
        acc.protein += (parseFloat(food.protein_g || 0) / 100) * quantity;
        acc.carbs += (parseFloat(food.carbs_g || 0) / 100) * quantity;
        acc.fat += (parseFloat(food.fat_g || 0) / 100) * quantity;
        return acc;
    }, { protein: 0, carbs: 0, fat: 0 });

    const caloriesConsumed = log ? parseFloat(log.consumed_calories) : 0;
    // Usar el objetivo del usuario si existe, de lo contrario usar un valor por defecto
    const calorieGoal = goal && goal.daily_calorie_goal 
        ? parseFloat(goal.daily_calorie_goal) 
        : 2000; // Valor por defecto si no hay objetivo
    const caloriesBurned = log ? parseFloat(log.burned_calories) : 0;

    return (
        <>
            <ModernNavbar />
            <main id="main-content" className="min-h-screen bg-[#FAF3E1] dark:bg-black pb-24 md:pb-8 transition-colors duration-300" role="main" aria-label="Dashboard principal">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8" data-tour="dashboard-header">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                            Resumen de tu progreso hoy
                        </p>
                    </div>

                    {loading ? (
                        <DashboardPageSkeleton />
                    ) : (
                        <>
                            {/* Guía de Primeros Pasos - Solo para usuarios nuevos */}
                            <FirstStepsGuide />

                            {/* Widget de Próxima Acción e Insights */}
                            <div className="mb-6">
                                <SmartRecommendations 
                                    goal={goal}
                                    log={log}
                                    mealItems={mealItems}
                                />
                            </div>

                            {/* Streak Tracker y Motivación */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <StreakTracker />
                                {streak > 0 && (
                                    <MotivationWidget streak={streak} progressData={monthlyProgress} />
                                )}
                            </div>

                            {/* Insight Cards de Progreso */}
                            {(weeklyComparison?.hasData || monthlyProgress?.hasData) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {weeklyComparison?.hasData && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl border-2 border-purple-200 dark:border-purple-800 p-6"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Comparación Semanal</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {Math.abs(weeklyComparison.weightDiff) > 0.01 && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Peso:</span>
                                                        <span className={`font-bold ${weeklyComparison.weightDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                            {weeklyComparison.weightDiff > 0 ? '+' : ''}{weeklyComparison.weightDiff.toFixed(1)} kg
                                                        </span>
                                                    </div>
                                                )}
                                                {Math.abs(weeklyComparison.caloriesDiff) > 10 && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Calorías:</span>
                                                        <span className={`font-bold ${weeklyComparison.caloriesDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            {weeklyComparison.caloriesDiff > 0 ? '+' : ''}{Math.round(weeklyComparison.caloriesDiff)} kcal
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {monthlyProgress?.hasData && goal && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl border-2 border-blue-200 dark:border-blue-800 p-6"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Progreso Mensual</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Hacia tu objetivo</span>
                                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                            {Math.round(monthlyProgress.totalProgress)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${monthlyProgress.totalProgress}%` }}
                                                            transition={{ duration: 1, delay: 0.2 }}
                                                            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2.5 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                                {Math.abs(monthlyProgress.monthlyChange) > 0.01 && (
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Cambio este mes:</span>
                                                        <span className={`font-bold ${monthlyProgress.monthlyChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {monthlyProgress.monthlyChange > 0 ? '+' : ''}{monthlyProgress.monthlyChange.toFixed(1)} kg
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Sección 1: Resumen de Calorías y Objetivos */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                {/* Gráfica Radial de Calorías */}
                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300" data-tour="calorie-widget">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            Calorías Consumidas
                                        </h2>
                                        {goal && goal.daily_calorie_goal && (
                                            <span className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                                Objetivo: {parseFloat(goal.daily_calorie_goal).toFixed(0)} kcal
                                            </span>
                                        )}
                                    </div>
                                    <CalorieRadialChart 
                                        consumed={caloriesConsumed} 
                                        goal={calorieGoal}
                                    />
                                    {!goal && (
                                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                💡 Establece un objetivo de peso para obtener recomendaciones personalizadas de calorías
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Gestor de Objetivos */}
                                <div data-tour="goals-widget">
                                    <GoalManager 
                                        currentWeight={log ? parseFloat(log.weight) : null}
                                        onGoalUpdated={(updatedGoal) => {
                                            setGoal(updatedGoal);
                                            // Recargar el objetivo para obtener las recomendaciones actualizadas
                                            fetchGoal();
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Sección 2: Evolución de Peso */}
                            <div className="mb-6">
                                <Suspense fallback={<WeightChartSkeleton />}>
                                    <WeightLineChart macros={totalMacros} />
                                </Suspense>
                            </div>

                            {/* Sección 2.5: Macros y Estadísticas Semanales */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                {/* Gráfico de Macros */}
                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300" data-tour="macros-widget">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Macronutrientes
                                    </h2>
                                    <MacroBarChart macros={totalMacros} goal={goal} />
                                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Proteína</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                {totalMacros.protein.toFixed(1)}g
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Carbohidratos</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                {totalMacros.carbs.toFixed(1)}g
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Grasas</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                {totalMacros.fat.toFixed(1)}g
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas Semanales */}
                                <WeeklyStatsWidget />
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { icon: 'food', label: 'Añadir Comida', path: '/diet', color: 'from-green-500 to-emerald-500' },
                                        { icon: 'workout', label: 'Entrenar', path: '/routines', color: 'from-blue-500 to-indigo-500' },
                                        { icon: 'scale', label: 'Registrar Peso', path: '/weight', color: 'from-purple-500 to-pink-500' },
                                        { icon: 'calendar', label: 'Ver Calendario', path: '/calendar', color: 'from-orange-500 to-red-500' },
                                    ].map((action, idx) => (
                                        <motion.button
                                            key={action.path}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(action.path)}
                                            className={`bg-gradient-to-br ${action.color} rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-all`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Icon name={action.icon} className="w-6 h-6 mx-auto mb-2" />
                                            <div className="text-xs font-medium text-center">{action.label}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Sección 3: Resumen Rápido */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#D45A0F]/10 dark:bg-blue-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D45A0F] dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Calorías Quemadas</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{(caloriesBurned || 0).toFixed(0)}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Peso Actual</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {log ? `${parseFloat(log.weight).toFixed(1)} kg` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Comidas Registradas</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{mealItems.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <BottomNavigation />
        </>
    );
};

export default Dashboard;
