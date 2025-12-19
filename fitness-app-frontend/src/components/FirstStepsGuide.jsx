import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Icon from './Icons';
import logger from '../utils/logger';
import { motion, AnimatePresence } from 'framer-motion';

const FirstStepsGuide = () => {
    const [onboardingStatus, setOnboardingStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await api.get('/onboarding/status');
                setOnboardingStatus(response.data);
            } catch (error) {
                logger.error('Error al obtener estado:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    if (loading || !onboardingStatus) {
        return null;
    }

    // Si el onboarding está completado, no mostrar la guía
    if (onboardingStatus.onboarding_completed) {
        return null;
    }

    const steps = [
        {
            id: 'weight',
            title: 'Registra tu peso inicial',
            description: 'Añade tu peso actual para comenzar a rastrear tu progreso',
            iconName: 'scale',
            completed: onboardingStatus.has_weight,
            path: '/weight',
            action: 'Ir a Peso',
        },
        {
            id: 'goal',
            title: 'Establece tus objetivos',
            description: 'Define tu peso objetivo y calorías diarias',
            iconName: 'target',
            completed: onboardingStatus.has_goal,
            path: '/dashboard',
            action: 'Ver Objetivos',
        },
        {
            id: 'routine',
            title: 'Crea tu primera rutina',
            description: 'Organiza tus ejercicios favoritos',
            iconName: 'workout',
            completed: false,
            path: '/routines',
            action: 'Crear Rutina',
        },
        {
            id: 'food',
            title: 'Registra tu primera comida',
            description: 'Comienza a llevar un registro de tu alimentación',
            iconName: 'food',
            completed: false,
            path: '/diet',
            action: 'Añadir Comida',
        },
    ];

    const completedSteps = steps.filter(s => s.completed).length;
    const progress = (completedSteps / steps.length) * 100;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-50 via-pink-50 to-green-50 dark:from-blue-900/20 dark:via-pink-900/20 dark:to-green-900/20 rounded-3xl border-2 border-blue-200 dark:border-blue-800 p-6 md:p-8 mb-6 transition-colors duration-300 shadow-lg"
        >
            <div className="flex items-start justify-between mb-6">
                <div>
                    <motion.h2 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                    >
                        ¡Bienvenido!
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Icon name="achievement" className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                        </motion.div>
                    </motion.h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        Completa estos primeros pasos para aprovechar al máximo la aplicación
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/welcome')}
                    className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                    Configuración
                </motion.button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Progreso de configuración
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {completedSteps} de {steps.length} completados
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                    <div 
                        className="bg-gradient-to-r from-blue-600 to-pink-500 rounded-full h-3 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Steps List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                        >
                            <Link
                                to={step.path}
                                className={`block p-4 rounded-2xl border-2 transition-all ${
                                    step.completed
                                        ? 'bg-white/50 dark:bg-gray-900/50 border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600'
                                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg'
                                }`}
                            >
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 ${step.completed ? 'opacity-50' : ''}`}>
                                <Icon name={step.iconName} className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-semibold ${step.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                        {step.title}
                                    </h3>
                                    {step.completed && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {step.description}
                                </p>
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {step.action} →
                                </span>
                            </div>
                        </div>
                    </Link>
                    </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default FirstStepsGuide;
