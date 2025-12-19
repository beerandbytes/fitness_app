import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar, Target, AlertCircle } from 'lucide-react';
import api from '../services/api';
import logger from '../utils/logger';
import useToastStore from '../stores/useToastStore';

/**
 * Componente mejorado de seguimiento de rachas (streaks)
 * Incluye visualización de calendario, notificaciones y freeze
 */
const StreakTracker = () => {
    const navigate = useNavigate();
    const toast = useToastStore();
    const [streakData, setStreakData] = useState(null);
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        fetchStreakData();
    }, []);

    const fetchStreakData = async () => {
        try {
            setLoading(true);
            const [streakResponse, calendarResponse] = await Promise.all([
                api.get('/streaks/current'),
                api.get('/streaks/calendar'),
            ]);
            setStreakData(streakResponse.data);
            setCalendarData(calendarResponse.data);
        } catch (error) {
            logger.error('Error al cargar streak:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFreeze = async () => {
        if (!streakData?.freezesAvailable || streakData.freezesAvailable <= 0) {
            toast.warning('No tienes freezes disponibles');
            return;
        }

        try {
            const response = await api.post('/streaks/freeze');
            toast.success('¡Freeze aplicado! Tu racha se mantiene.');
            await fetchStreakData();
        } catch (error) {
            logger.error('Error al aplicar freeze:', error);
            toast.error('Error al aplicar freeze');
        }
    };

    if (loading || !streakData) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    const { streak, isAtRisk, nextMilestone, progressToNextMilestone, achievedMilestones, freezesAvailable } = streakData;

    // Si no hay racha, mostrar incentivo para comenzar
    if (streak === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl border-2 border-orange-200 dark:border-orange-800 p-6 shadow-lg"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Comienza tu racha</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Entrena hoy para empezar</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/routines')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
                >
                    Entrenar Ahora
                </button>
            </motion.div>
        );
    }

    // Generar días del calendario del mes actual
    const generateCalendarDays = () => {
        if (!calendarData?.activityMap) return [];
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        // Días vacíos al inicio
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isActive = calendarData.activityMap[dateStr] || false;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            days.push({ day, dateStr, isActive, isToday });
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Flame className="w-7 h-7 text-white fill-current" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl">{streak} días</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Racha actual</p>
                    </div>
                </div>
                {isAtRisk && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium"
                    >
                        <AlertCircle className="w-4 h-4" />
                        En riesgo
                    </motion.div>
                )}
            </div>

            {/* Alerta de riesgo */}
            {isAtRisk && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                                ¡Entrena hoy para mantener tu racha!
                            </h4>
                            <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
                                No quieres perder {streak} días de esfuerzo
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate('/routines')}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                                >
                                    Entrenar Ahora
                                </button>
                                {freezesAvailable > 0 && (
                                    <button
                                        onClick={handleFreeze}
                                        className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors"
                                    >
                                        Usar Freeze ({freezesAvailable})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Progreso al siguiente hito */}
            {nextMilestone && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Próximo hito: {nextMilestone} días
                            </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {streak}/{nextMilestone}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressToNextMilestone}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                        />
                    </div>
                </div>
            )}

            {/* Hitos alcanzados */}
            {achievedMilestones.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {achievedMilestones.map((milestone) => (
                        <div
                            key={milestone}
                            className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {milestone} días
                        </div>
                    ))}
                </div>
            )}

            {/* Calendario */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                    <Calendar className="w-4 h-4" />
                    {showCalendar ? 'Ocultar' : 'Ver'} Calendario
                </button>

                <AnimatePresence>
                    {showCalendar && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-7 gap-2"
                        >
                            {/* Días de la semana */}
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                                    {day}
                                </div>
                            ))}
                            {/* Días del mes */}
                            {calendarDays.map((dayData, index) => {
                                if (dayData === null) {
                                    return <div key={`empty-${index}`} />;
                                }
                                return (
                                    <motion.div
                                        key={dayData.dateStr}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: index * 0.01 }}
                                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                            dayData.isToday
                                                ? 'ring-2 ring-orange-500 ring-offset-2'
                                                : ''
                                        } ${
                                            dayData.isActive
                                                ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {dayData.day}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default StreakTracker;

