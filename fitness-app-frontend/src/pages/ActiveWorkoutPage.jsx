import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkoutTimer from '../components/WorkoutTimer';
import api from '../services/api';
import logger from '../utils/logger';
import useToastStore from '../stores/useToastStore';
import { ActiveWorkoutPageSkeleton } from '../components/ActiveWorkoutPageSkeleton';
import ModernNavbar from '../components/ModernNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import AppLayout from '../app/layout/AppLayout';
import PageContainer from '../shared/components/layout/PageContainer';

const ActiveWorkoutPage = () => {
    const { routineId } = useParams();
    const navigate = useNavigate();
    const toast = useToastStore();

    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [exerciseTime, setExerciseTime] = useState(0);
    const [workoutStartTime, setWorkoutStartTime] = useState(null);
    const [completedExercises, setCompletedExercises] = useState([]);
    const [exerciseData, setExerciseData] = useState({});
    const [restTime, setRestTime] = useState(90);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [lastExerciseData, setLastExerciseData] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);
    const [suggestedWeight, setSuggestedWeight] = useState(null);

    const restIntervalRef = useRef(null);
    const exerciseIntervalRef = useRef(null);
    const audioRef = useRef(null);
    const synthRef = useRef(null);

    const restDuration = 90; // 90 segundos de descanso por defecto

    // Extraer valores primitivos de routine para usar como dependencias estables
    const routineIdValue = routine?.routine_id;
    const currentExerciseId = routine?.exercises?.[currentExerciseIndex]?.exercise_id;
    const routineExercisesLength = routine?.exercises?.length;

    // Memoizar fetchRoutineDetails para evitar recreaciones y stale closures
    const fetchRoutineDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/routines/${routineId}`);
            setRoutine(response.data.routine);
            setWorkoutStartTime(new Date());
        } catch (error) {
            logger.error('Error al cargar rutina:', error);
            toast.error('Error al cargar la rutina');
            navigate('/routines');
        } finally {
            setLoading(false);
        }
    }, [routineId, navigate, toast]);

    // Inicializar Web Speech API para voz
    useEffect(() => {
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    // Solicitar modo pantalla completa automáticamente en móviles
    useEffect(() => {
        const requestFullscreen = async () => {
            if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                try {
                    await document.documentElement.requestFullscreen();
                    setIsFullscreen(true);
                } catch (err) {
                    logger.warn('No se pudo activar pantalla completa:', err);
                }
            }
        };
        requestFullscreen();

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        fetchRoutineDetails();
    }, [fetchRoutineDetails]);

    useEffect(() => {
        // Prevenir salida accidental
        const handleBeforeUnload = (e) => {
            if (workoutStartTime && completedExercises.length < (routine?.exercises?.length || 0)) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (restIntervalRef.current) clearInterval(restIntervalRef.current);
            if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
        };
    }, [workoutStartTime, completedExercises.length, routine?.exercises?.length]);

    const handleExit = () => {
        if (completedExercises.length > 0 && completedExercises.length < (routine?.exercises?.length || 0)) {
            if (window.confirm('¿Estás seguro de que quieres salir? Tu progreso actual de la rutina se perderá.')) {
                navigate('/routines');
            }
        } else {
            navigate('/routines');
        }
    };

    // Cargar historial del ejercicio para sugerencias
    // Usar useRef para acceder al valor más reciente de routine sin causar recreaciones
    const routineRef = useRef(routine);
    useEffect(() => {
        routineRef.current = routine;
    }, [routine]);

    // Cargar historial del ejercicio
    // Memoizar para evitar recreaciones y stale closures
    const loadExerciseHistory = useCallback(async (exerciseId) => {
        try {
            const response = await api.get(`/workouts?exercise_id=${exerciseId}&limit=1`);
            if (response.data.workouts && response.data.workouts.length > 0) {
                const lastWorkout = response.data.workouts[0];
                setLastExerciseData({
                    sets_done: lastWorkout.sets_done,
                    reps_done: lastWorkout.reps_done,
                    weight_kg: lastWorkout.weight_kg,
                    date: lastWorkout.date,
                });
                // Sugerir peso basado en el último entrenamiento
                if (lastWorkout.weight_kg) {
                    const lastWeight = parseFloat(lastWorkout.weight_kg);
                    // Usar routineRef para acceder al valor más reciente sin causar recreaciones
                    const currentRoutine = routineRef.current;
                    const currentExercise = currentRoutine?.exercises?.[currentExerciseIndex];
                    if (currentExercise && lastWorkout.sets_done >= currentExercise.sets) {
                        setSuggestedWeight(lastWeight + 2.5); // Incrementar 2.5kg si completó todas las series
                    } else {
                        setSuggestedWeight(lastWeight); // Mantener mismo peso
                    }
                }
            }
        } catch (error) {
            logger.error('Error al cargar historial:', error);
        }
    }, [currentExerciseIndex]);

    useEffect(() => {
        // Usar valores primitivos como dependencias para evitar bucles infinitos
        if (currentExerciseId && currentExerciseIndex >= 0) {
            const currentRoutine = routineRef.current;
            if (currentRoutine && currentRoutine.exercises && currentRoutine.exercises[currentExerciseIndex]) {
                loadExerciseHistory(currentExerciseId);
            }
        }
    }, [currentExerciseId, currentExerciseIndex, loadExerciseHistory]);

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => logger.warn('Error al reproducir sonido:', e));
        }
    };

    // Vibrar (si está disponible)
    const vibrate = (pattern = [200]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };

    // Notificación de voz
    const speak = (text) => {
        if (voiceEnabled && synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            synthRef.current.speak(utterance);
        }
    };

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            logger.warn('Error al cambiar modo pantalla completa:', err);
        }
    };

    const startRest = () => {
        setIsResting(true);
        setRestTime(restDuration);
        vibrate([100, 50, 100]); // Vibrar al iniciar descanso
        speak('Tiempo de descanso');

        if (restIntervalRef.current) clearInterval(restIntervalRef.current);

        restIntervalRef.current = setInterval(() => {
            setRestTime((prev) => {
                if (prev === 10) {
                    speak('10 segundos');
                    vibrate([100]);
                } else if (prev === 5) {
                    speak('5');
                    vibrate([100]);
                } else if (prev === 3) {
                    speak('3');
                    vibrate([50]);
                } else if (prev === 2) {
                    speak('2');
                    vibrate([50]);
                } else if (prev === 1) {
                    speak('1');
                    vibrate([50]);
                }

                if (prev <= 1) {
                    clearInterval(restIntervalRef.current);
                    setIsResting(false);
                    playSound();
                    vibrate([200, 100, 200]); // Vibrar más fuerte al terminar
                    speak('Siguiente ejercicio');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const skipRest = () => {
        if (restIntervalRef.current) clearInterval(restIntervalRef.current);
        setIsResting(false);
        setRestTime(0);
    };

    const startExerciseTimer = () => {
        if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);

        exerciseIntervalRef.current = setInterval(() => {
            setExerciseTime((prev) => prev + 1);
        }, 1000);
    };

    const stopExerciseTimer = () => {
        if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTotalWorkoutTime = () => {
        if (!workoutStartTime) return 0;
        return Math.floor((new Date() - workoutStartTime) / 1000);
    };

    const handleSetComplete = async () => {
        const currentExercise = routine.exercises[currentExerciseIndex];
        if (!currentExercise) return;

        const exerciseKey = `${currentExercise.exercise_id}-${currentExerciseIndex}`;
        const currentData = exerciseData[exerciseKey] || {
            sets: [],
            reps: [],
            weights: [],
            durations: [],
        };

        const newSet = {
            setNumber: currentSet,
            reps: currentExercise.reps || null,
            weight: parseFloat(currentExercise.weight_kg) || 0,
            duration: exerciseTime,
        };

        currentData.sets.push(newSet);
        setExerciseData({
            ...exerciseData,
            [exerciseKey]: currentData,
        });

        stopExerciseTimer();

        // Si hay más series, avanzar a la siguiente
        if (currentSet < currentExercise.sets) {
            setCurrentSet(currentSet + 1);
            setExerciseTime(0);
            startRest();
        } else {
            // Ejercicio completado
            handleExerciseComplete();
        }
    };

    const handleExerciseComplete = async () => {
        const currentExercise = routine.exercises[currentExerciseIndex];
        if (!currentExercise) return;

        const exerciseKey = `${currentExercise.exercise_id}-${currentExerciseIndex}`;
        const data = exerciseData[exerciseKey];

        // Calcular totales
        const totalSets = data.sets.length;
        const totalReps = data.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
        const totalDuration = data.sets.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgWeight = data.sets.length > 0
            ? data.sets.reduce((sum, s) => sum + (s.weight || 0), 0) / data.sets.length
            : 0;

        // Calcular calorías (estimación)
        let burnedCalories = 0;
        if (currentExercise.category === 'Cardio' && totalDuration > 0) {
            const minutes = totalDuration / 60;
            burnedCalories = minutes * (parseFloat(currentExercise.default_calories_per_minute) || 10);
        } else if (totalReps > 0) {
            burnedCalories = totalReps * 0.5 + totalSets * 5;
        } else {
            burnedCalories = totalSets * 5;
        }

        // Guardar ejercicio completado
        try {
            await api.post('/workouts/log', {
                exercise_id: currentExercise.exercise_id,
                sets_done: totalSets,
                reps_done: totalReps > 0 ? totalReps : null,
                duration_minutes: totalDuration > 0 ? (totalDuration / 60).toFixed(2) : null,
                weight_kg: avgWeight,
                burned_calories: Math.round(burnedCalories),
            });

            setCompletedExercises([...completedExercises, currentExercise.exercise_id]);
            setCurrentSet(1);
            setExerciseTime(0);
            stopExerciseTimer();

            // Animación de celebración
            setShowCelebration(true);
            vibrate([100, 50, 100, 50, 200]);
            speak('Ejercicio completado');

            setTimeout(() => setShowCelebration(false), 2000);

            // Avanzar al siguiente ejercicio o finalizar
            if (currentExerciseIndex < routine.exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                startRest();
            } else {
                handleWorkoutComplete();
            }
        } catch (error) {
            logger.error('Error al guardar ejercicio:', error);
            toast.warning('Error al guardar el ejercicio. Continuando...');
            // Continuar de todas formas
            if (currentExerciseIndex < routine.exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                startRest();
            } else {
                handleWorkoutComplete();
            }
        }
    };

    const handleWorkoutComplete = () => {
        const totalTime = getTotalWorkoutTime();
        vibrate([200, 100, 200, 100, 300]);
        speak(`Rutina completada en ${Math.floor(totalTime / 60)} minutos`);
        toast.success(`¡Rutina completada! Tiempo total: ${formatTime(totalTime)}`);

        // Mostrar celebración final
        setShowCelebration(true);
        setTimeout(() => {
            setShowCelebration(false);
            navigate('/routines');
        }, 3000);
    };

    const handleSkipExercise = () => {
        setShowSkipConfirm(true);
    };

    const confirmSkipExercise = () => {
        setShowSkipConfirm(false);
        if (currentExerciseIndex < routine.exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setCurrentSet(1);
            setExerciseTime(0);
            stopExerciseTimer();
            startRest();
        }
    };

    if (loading) {
        return <ActiveWorkoutPageSkeleton />;
    }

    if (!routine || routine.exercises.length === 0) {
        return (
            <AppLayout>
                <PageContainer>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-6 text-red-600 dark:text-red-400">
                        Esta rutina no tiene ejercicios.
                    </div>
                    <button
                        onClick={() => navigate('/routines')}
                        className="mt-4 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                        Volver a Rutinas
                    </button>
                </PageContainer>
            </AppLayout>
        );
    }

    const currentExercise = routine.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / routine.exercises.length) * 100;
    const exerciseKey = `${currentExercise.exercise_id}-${currentExerciseIndex}`;
    const exerciseDataForCurrent = exerciseData[exerciseKey] || { sets: [] };

    return (
        <div className="min-h-screen bg-[#FAF3E1] dark:bg-black transition-colors duration-300">
            <ModernNavbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
                {/* Header con progreso */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                            {routine.name}
                        </h1>
                        <div className="flex gap-2">
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                            >
                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setVoiceEnabled(!voiceEnabled)}
                                className={`p-2 rounded-xl transition-colors ${voiceEnabled
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                aria-label={voiceEnabled ? "Desactivar voz" : "Activar voz"}
                            >
                                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleExit}
                                className="px-4 py-2 min-h-[44px] bg-red-600 dark:bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors w-full sm:w-auto"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span>Ejercicio {currentExerciseIndex + 1} de {routine.exercises.length}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Tiempo: {formatTime(getTotalWorkoutTime())}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Modo Descanso con Temporizador Mejorado */}
                {isResting && (
                    <div className="mb-6">
                        <WorkoutTimer
                            exerciseDuration={0}
                            restDuration={restDuration}
                            onRestComplete={() => {
                                setIsResting(false);
                                setRestTime(0);
                            }}
                            autoStart={true}
                        />
                        <div className="text-center mt-4">
                            <button
                                onClick={skipRest}
                                className="px-6 py-3 min-h-[44px] bg-yellow-600 dark:bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
                            >
                                Saltar Descanso
                            </button>
                        </div>
                    </div>
                )}

                {/* Ejercicio Actual */}
                {!isResting && (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
                        <div className="text-center mb-4 sm:mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {currentExercise.exercise_name || currentExercise.name}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                {currentExercise.category}
                            </p>
                        </div>

                        {/* Información del ejercicio */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    Serie {currentSet} / {currentExercise.sets}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Series
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatTime(exerciseTime)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Tiempo
                                </div>
                            </div>
                        </div>

                        {/* Detalles de la serie */}
                        {currentExercise.reps && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
                                <div className="text-center">
                                    <div className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                                        Objetivo: {currentExercise.reps} repeticiones
                                    </div>
                                    <div className="flex items-center justify-center gap-3 mt-2">
                                        {currentExercise.weight_kg > 0 && (
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                Peso rutina: {currentExercise.weight_kg} kg
                                            </div>
                                        )}
                                        {suggestedWeight && (
                                            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                                                💡 Sugerido: {suggestedWeight} kg
                                            </div>
                                        )}
                                    </div>
                                    {lastExerciseData && (
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                                            Última vez: {lastExerciseData.sets_done} series × {lastExerciseData.reps_done || 'N/A'} reps @ {lastExerciseData.weight_kg || 0}kg
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentExercise.duration_minutes && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
                                <div className="text-center">
                                    <div className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                                        Duración objetivo: {currentExercise.duration_minutes} minutos
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Series completadas */}
                        {exerciseDataForCurrent.sets.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Series completadas:
                                </h3>
                                <div className="space-y-2">
                                    {exerciseDataForCurrent.sets.map((set, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2 text-sm"
                                        >
                                            Serie {set.setNumber}: {set.reps || 'N/A'} reps
                                            {set.weight > 0 && ` @ ${set.weight}kg`}
                                            {set.duration > 0 && ` (${formatTime(set.duration)})`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                onClick={() => {
                                    if (exerciseTime === 0) startExerciseTimer();
                                    handleSetComplete();
                                }}
                                className="flex-1 px-6 py-4 min-h-[44px] bg-green-600 dark:bg-green-500 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                            >
                                {exerciseTime === 0 ? 'Iniciar Serie' : 'Completar Serie'}
                            </button>
                            <button
                                onClick={handleSkipExercise}
                                className="px-6 py-4 min-h-[44px] bg-gray-600 dark:bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                            >
                                Saltar Ejercicio
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de ejercicios */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-base sm:text-lg">
                        Ejercicios de la rutina
                    </h3>
                    <div className="space-y-2">
                        {routine.exercises.map((ex, idx) => (
                            <div
                                key={ex.routine_exercise_id || idx}
                                className={`p-3 rounded-xl border-2 transition-colors ${idx === currentExerciseIndex
                                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : completedExercises.includes(ex.exercise_id)
                                        ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {completedExercises.includes(ex.exercise_id) && (
                                            <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                                        )}
                                        {idx === currentExerciseIndex && !completedExercises.includes(ex.exercise_id) && (
                                            <span className="text-blue-600 dark:text-blue-400 text-xl">▶</span>
                                        )}
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {ex.exercise_name || ex.name}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {ex.sets} series
                                        {ex.reps && ` × ${ex.reps} reps`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Animación de celebración */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-12 text-center shadow-2xl"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.6, repeat: 2 }}
                                    className="text-6xl mb-4"
                                >
                                    🎉
                                </motion.div>
                                <h3 className="text-3xl font-bold text-white mb-2">¡Excelente!</h3>
                                <p className="text-white/90 text-lg">
                                    {currentExerciseIndex < routine.exercises.length - 1
                                        ? 'Ejercicio completado'
                                        : '¡Rutina completada!'}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modal de confirmación para saltar ejercicio */}
                <AnimatePresence>
                    {showSkipConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => setShowSkipConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl"
                            >
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    ¿Saltar este ejercicio?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Se saltará {currentExercise.exercise_name || currentExercise.name}.
                                    Puedes continuar con el siguiente ejercicio.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowSkipConfirm(false)}
                                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmSkipExercise}
                                        className="flex-1 px-4 py-3 bg-orange-600 dark:bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                                    >
                                        Saltar
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            {/* Audio para notificaciones */}
            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77+efTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+/nn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC" />
            </audio>
        </div>
    );
};

export default ActiveWorkoutPage;

