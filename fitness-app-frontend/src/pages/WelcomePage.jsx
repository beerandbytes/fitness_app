import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBrandStore from '../stores/useBrandStore';
import useToastStore from '../stores/useToastStore';
import useUserStore from '../stores/useUserStore';
import api from '../services/api';
import Icon from '../components/Icons';
import logger from '../utils/logger';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import ValidatedInput from '../components/ValidatedInput';
import { ageValidator, heightValidator, weightValidator, caloriesValidator } from '../utils/validators';
import { trackEvent, AnalyticsEvents } from '../utils/analytics';
import EnhancedInteractiveTour from '../components/EnhancedInteractiveTour';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomePage = () => {
    const navigate = useNavigate();
    const brandSettings = useBrandStore((state) => state.brandSettings);
    const toast = useToastStore();
    const loadUser = useUserStore((state) => state.loadUser);
    const { progress, isLoading: progressLoading, saveProgress, clearProgress, hasSavedProgress, restoreProgress } = useOnboardingProgress();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        gender: '',
        age: '',
        height: '',
        initial_weight: '',
        target_weight: '',
        goal_type: 'weight_loss',
        daily_calorie_goal: '',
        activity_level: 'moderate',
    });
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [showRestoreBanner, setShowRestoreBanner] = useState(false);
    const [stats, setStats] = useState(null);
    const [showTour, setShowTour] = useState(false);

    // Cargar estadísticas para social proof
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/onboarding/stats');
                setStats(response.data);
            } catch (error) {
                logger.error('Error al cargar estadísticas:', error);
                // Valores por defecto si falla
                setStats({
                    totalUsers: 10000,
                    activeUsers: 5000,
                    usersAchievingGoals: 3500,
                    completionRate: 85,
                });
            }
        };
        fetchStats();
    }, []);

    // Restaurar progreso guardado al montar
    useEffect(() => {
        if (!progressLoading && hasSavedProgress()) {
            const restored = restoreProgress();
            if (restored) {
                setCurrentStep(restored.step);
                setFormData(restored.formData);
                setShowRestoreBanner(true);
            }
        }
    }, [progressLoading, hasSavedProgress, restoreProgress]);

    // Mostrar tour interactivo en el primer paso
    useEffect(() => {
        if (currentStep === 1) {
            const hasSeenTour = localStorage.getItem('onboarding_tour_completed');
            if (!hasSeenTour) {
                setTimeout(() => setShowTour(true), 1000);
            }
        }
    }, [currentStep]);

    // Guardar progreso después de cada cambio
    useEffect(() => {
        if (currentStep > 1 && !progressLoading) {
            saveProgress(currentStep, formData);
        }
    }, [currentStep, formData, saveProgress, progressLoading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNext = () => {
        // Validar campos antes de avanzar
        if (currentStep === 2) {
            if (!formData.gender || !formData.age || !formData.height) {
                toast.warning('Por favor completa todos los campos obligatorios');
                return;
            }
        }
        if (currentStep === 3) {
            if (!formData.initial_weight) {
                toast.warning('Por favor ingresa tu peso actual');
                return;
            }
        }
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        // Validar todos los campos obligatorios
        if (!formData.gender || !formData.age || !formData.height || !formData.initial_weight) {
            toast.warning('Por favor completa todos los campos obligatorios');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/onboarding/initial-setup', {
                gender: formData.gender,
                age: parseInt(formData.age),
                height: parseFloat(formData.height),
                initial_weight: parseFloat(formData.initial_weight),
                target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
                goal_type: formData.goal_type,
                daily_calorie_goal: formData.daily_calorie_goal ? parseFloat(formData.daily_calorie_goal) : null,
                activity_level: formData.activity_level,
            });
            
            // Recargar el usuario para obtener el estado actualizado de onboarding
            await loadUser();
            
            // Guardar recomendaciones si vienen en la respuesta
            if (response.data.recommendations) {
                setRecommendations(response.data.recommendations);
                setCurrentStep(5); // Mostrar paso de recomendaciones
            } else {
                // Si no hay recomendaciones, redirigir al dashboard
                trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED);
                // El OnboardingGuard se encargará de verificar el estado
                navigate('/dashboard', { replace: true });
            }
        } catch (error) {
            logger.error('Error al completar onboarding:', error);
            toast.error(error.response?.data?.error || 'Error al completar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = async () => {
        // Limpiar progreso guardado al completar
        clearProgress();
        // Trackear evento
        trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED);
        // Recargar el usuario antes de redirigir
        await loadUser();
        navigate('/dashboard', { replace: true });
    };

    const handleSkip = async () => {
        // Marcar onboarding como completado sin datos
        try {
            // Opcional: marcar como completado en el backend
            // Por ahora, solo redirigir y el usuario puede completar después
            clearProgress();
            trackEvent(AnalyticsEvents.ONBOARDING_SKIPPED);
            await loadUser();
            navigate('/dashboard', { replace: true });
        } catch (error) {
            logger.error('Error al saltar onboarding:', error);
            toast.error('Error al saltar la configuración');
        }
    };

    const handleRestoreProgress = () => {
        const restored = restoreProgress();
        if (restored) {
            setCurrentStep(restored.step);
            setFormData(restored.formData);
            setShowRestoreBanner(false);
            toast.success('Progreso restaurado');
        }
    };

    const handleDismissRestoreBanner = () => {
        setShowRestoreBanner(false);
        clearProgress();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fafafa] via-white to-[#f5f5f5] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12">
                {/* Banner de progreso guardado */}
                {showRestoreBanner && hasSavedProgress() && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm text-blue-800 dark:text-blue-300 flex-1">
                                Tienes un progreso guardado del paso {progress?.step || 1}. ¿Deseas continuar donde lo dejaste?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRestoreProgress}
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Continuar
                                </button>
                                <button
                                    onClick={handleDismissRestoreBanner}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                    aria-label="Cerrar"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Paso {currentStep} de {recommendations ? 5 : 4}
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {Math.round((currentStep / (recommendations ? 5 : 4)) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-blue-600 dark:bg-blue-500 rounded-full h-2 transition-all duration-300"
                            style={{ width: `${(currentStep / (recommendations ? 5 : 4)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Step 1: Bienvenida Mejorada */}
                {currentStep === 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center space-y-6"
                    >
                        {/* Animación de bienvenida */}
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="welcome-hero-icon w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl relative"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-4 border-white/20"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
                        >
                            ¡Bienvenido a {brandSettings.brand_name}!
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-gray-700 dark:text-gray-300 max-w-md mx-auto"
                        >
                            Estamos emocionados de acompañarte en tu viaje hacia una vida más saludable.
                        </motion.p>
                        
                        {/* Social Proof */}
                        {stats && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-900/20 dark:to-pink-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                            >
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {stats.totalUsers > 1000 
                                                ? `${(stats.totalUsers / 1000).toFixed(1)}K+` 
                                                : stats.totalUsers}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Usuarios</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                            {stats.usersAchievingGoals > 1000 
                                                ? `${(stats.usersAchievingGoals / 1000).toFixed(1)}K+` 
                                                : stats.usersAchievingGoals}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Alcanzando objetivos</div>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                    Únete a miles de usuarios que ya están transformando sus vidas
                                </p>
                            </motion.div>
                        )}
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto"
                        >
                            Te guiaremos a través de unos sencillos pasos para configurar tu perfil y empezar a alcanzar tus objetivos.
                        </motion.p>

                        {/* Beneficios rápidos */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="grid grid-cols-3 gap-3 mt-8 max-w-lg mx-auto"
                        >
                            {[
                                { icon: '📊', text: 'Tracking' },
                                { icon: '🎯', text: 'Objetivos' },
                                { icon: '💪', text: 'Rutinas' },
                            ].map((item, idx) => (
                                <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="text-2xl mb-1">{item.icon}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{item.text}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {/* Tour Interactivo */}
                {showTour && currentStep === 1 && (
                    <EnhancedInteractiveTour
                        steps={[
                            {
                                target: '.welcome-hero-icon',
                                title: '¡Bienvenido!',
                                content: 'Completa estos sencillos pasos para configurar tu perfil y empezar tu viaje hacia una vida más saludable.',
                            },
                        ]}
                        tourId="onboarding_welcome"
                        onComplete={() => {
                            setShowTour(false);
                            localStorage.setItem('onboarding_tour_completed', 'true');
                        }}
                        onSkip={() => {
                            setShowTour(false);
                            localStorage.setItem('onboarding_tour_completed', 'true');
                        }}
                        autoStart={true}
                    />
                )}

                {/* Step 2: Datos Personales */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Información Personal
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Necesitamos estos datos para calcular recomendaciones personalizadas
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Género *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'male', label: 'Hombre', icon: '👨' },
                                        { value: 'female', label: 'Mujer', icon: '👩' },
                                        { value: 'other', label: 'Otro', icon: '🧑' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, gender: option.value }))}
                                            className={`p-4 rounded-2xl border-2 transition-all ${
                                                formData.gender === option.value
                                                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-600'
                                            }`}
                                        >
                                            <div className="text-3xl mb-2">{option.icon}</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ValidatedInput
                                label="Edad (años)"
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                validator={ageValidator}
                                placeholder="Ej: 30"
                                min="1"
                                max="120"
                                required
                            />
                            <ValidatedInput
                                label="Altura (cm)"
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleInputChange}
                                validator={heightValidator}
                                placeholder="Ej: 170"
                                min="50"
                                max="300"
                                required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                                Tu altura nos ayudará a calcular tu IMC y recomendaciones personalizadas
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 3: Peso */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Tu Peso
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Esto nos ayudará a hacer un seguimiento de tu progreso
                            </p>
                        </div>
                        <div className="space-y-4">
                            <ValidatedInput
                                label="Peso actual (kg)"
                                type="number"
                                name="initial_weight"
                                value={formData.initial_weight}
                                onChange={handleInputChange}
                                validator={weightValidator}
                                placeholder="Ej: 70"
                                step="0.1"
                                min="20"
                                max="300"
                                required
                            />
                            <ValidatedInput
                                label="Peso objetivo (kg)"
                                type="number"
                                name="target_weight"
                                value={formData.target_weight}
                                onChange={handleInputChange}
                                validator={(value) => {
                                    if (!value) return { valid: true, message: '' }; // Opcional
                                    return weightValidator(value);
                                }}
                                placeholder="Ej: 65"
                                step="0.1"
                                min="20"
                                max="300"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                                ¿Cuál es tu peso ideal? Esto nos ayudará a crear un plan personalizado
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 4: Objetivos */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Tus Objetivos
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                ¿Qué quieres lograr?
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Objetivo principal
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { value: 'weight_loss', label: 'Perder Peso', iconName: 'weightLoss' },
                                        { value: 'weight_gain', label: 'Ganar Peso', iconName: 'weightGain' },
                                        { value: 'maintain', label: 'Mantener Peso', iconName: 'scale' },
                                        { value: 'muscle_gain', label: 'Ganar Músculo', iconName: 'muscleGain' },
                                    ].map((goal) => (
                                        <button
                                            key={goal.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, goal_type: goal.value }))}
                                            className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                                formData.goal_type === goal.value
                                                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-600'
                                            }`}
                                        >
                                            <div className="flex-shrink-0">
                                                <Icon name={goal.iconName} className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{goal.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ValidatedInput
                                label="Objetivo de calorías diarias (kcal)"
                                type="number"
                                name="daily_calorie_goal"
                                value={formData.daily_calorie_goal}
                                onChange={handleInputChange}
                                validator={caloriesValidator}
                                placeholder="Ej: 2000"
                                min="500"
                                max="10000"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                                Dejaremos que la app calcule tu objetivo calórico si no lo ingresas
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nivel de actividad física
                                </label>
                                <select
                                    name="activity_level"
                                    value={formData.activity_level}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-white"
                                >
                                    <option value="sedentary">Sedentario (poco o nada de ejercicio)</option>
                                    <option value="light">Ligera (ejercicio ligero/deportes 1-3 días/semana)</option>
                                    <option value="moderate">Moderado (ejercicio moderado 3-5 días/semana)</option>
                                    <option value="active">Activo (ejercicio fuerte 6-7 días/semana)</option>
                                    <option value="very_active">Muy activo (ejercicio muy fuerte, trabajo físico)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Recommendations con celebración */}
                {currentStep === 5 && recommendations && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Celebración */}
                        <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="text-center mb-6"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <motion.h2 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                            >
                                ¡Configuración Completada! 🎉
                            </motion.h2>
                            <motion.p 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-600 dark:text-gray-400 mb-4"
                            >
                                Basado en tu información, hemos calculado tus recomendaciones personalizadas
                            </motion.p>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                            >
                                ¡Ya estás listo para comenzar tu viaje!
                            </motion.div>
                        </motion.div>
                        
                        <div className="space-y-4">
                            {/* Current stats */}
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Estado Actual</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">BMI:</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{recommendations.current.bmi}</span>
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({recommendations.current.bmiCategory})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Grasa Corporal:</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{recommendations.current.bodyFat}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">BMR (Metabolismo Basal):</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{recommendations.current.bmr} kcal</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">TDEE (Gasto Calórico Diario):</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{recommendations.current.tdee} kcal</span>
                                    </div>
                                </div>
                            </div>

                            {/* Target stats */}
                            {recommendations.target && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Objetivos Recomendados</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Peso Objetivo:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{recommendations.target.weight} kg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">BMI Objetivo:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{recommendations.target.bmi}</span>
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({recommendations.target.bmiCategory})</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Grasa Corporal Objetivo:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{recommendations.target.bodyFat}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Calorías Diarias Recomendadas:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{recommendations.target.dailyCalories} kcal</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {recommendations.message && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Icon name="recommendation" className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        Recomendación
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {recommendations.message}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Beneficios inmediatos */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                                Lo que puedes hacer ahora:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { icon: '📊', text: 'Ver tu dashboard personalizado', action: 'Ver Dashboard' },
                                    { icon: '💪', text: 'Crear tu primera rutina', action: 'Crear Rutina' },
                                    { icon: '🍎', text: 'Registrar tu primera comida', action: 'Añadir Comida' },
                                    { icon: '📈', text: 'Seguir tu progreso día a día', action: 'Ver Progreso' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                    {currentStep > 1 && currentStep < 5 && (
                        <button
                            onClick={handleBack}
                            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Paso anterior"
                        >
                            Atrás
                        </button>
                    )}
                    {currentStep < 4 && (
                        <>
                            <button
                                onClick={handleNext}
                                className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                aria-label="Siguiente paso"
                            >
                                Siguiente
                            </button>
                            {currentStep === 1 && (
                                <button
                                    onClick={handleSkip}
                                    className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium transition-colors"
                                    aria-label="Saltar configuración inicial"
                                >
                                    Saltar por ahora
                                </button>
                            )}
                        </>
                    )}
                    {currentStep === 4 && (
                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Procesando...
                                </>
                            ) : (
                                'Completar Configuración'
                            )}
                        </button>
                    )}
                    {currentStep === 5 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleFinish}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all shadow-lg"
                        >
                            🚀 Comenzar mi Viaje
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
