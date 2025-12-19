import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import api from '../services/api';
import logger from '../utils/logger';
import useToastStore from '../stores/useToastStore';
import useUserStore from '../stores/useUserStore';
import OptimizedImage from '../components/OptimizedImage';
import { ExercisesPageSkeleton } from '../components/ExercisesPageSkeleton';
import CreateExerciseModal from '../components/CreateExerciseModal';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Filter, Plus, X } from 'lucide-react';

const CATEGORIES = ['Todos', 'Fuerza', 'Cardio', 'Híbrido'];
const MUSCLE_GROUPS = [
    { id: 'all', name: 'Todos', icon: '💪' },
    { id: 'pecho', name: 'Pecho', icon: '💪' },
    { id: 'pierna', name: 'Piernas', icon: '🦵' },
    { id: 'espalda', name: 'Espalda', icon: '🏋️' },
    { id: 'brazos', name: 'Brazos', icon: '💪' },
    { id: 'hombros', name: 'Hombros', icon: '🤸' },
];

// Helper function to detect if URL is a real animated GIF
const isAnimatedGif = (url) => {
    if (!url) return false;
    // Check if URL ends with .gif (case insensitive) before any query string
    const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
    return match && match[1].toLowerCase() === 'gif';
};

// Componente de grid virtualizado para ejercicios
const VirtualizedExerciseGrid = ({ exercises, onAddToRoutine, displayName, onViewGif, getExerciseImageUrl }) => {
    const parentRef = useRef(null);
    const [columnsPerRow, setColumnsPerRow] = useState(4);
    
    // Calcular columnas según el tamaño de pantalla
    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width >= 1280) {
                setColumnsPerRow(4); // xl
            } else if (width >= 1024) {
                setColumnsPerRow(3); // lg
            } else if (width >= 768) {
                setColumnsPerRow(2); // md
            } else {
                setColumnsPerRow(1); // sm
            }
        };
        
        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);
    
    const rows = Math.ceil(exercises.length / columnsPerRow);
    
    const rowVirtualizer = useVirtualizer({
        count: rows,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 450, // Altura estimada de cada fila (ajustada para cards con altura uniforme)
        overscan: 2,
    });

    if (exercises.length === 0) return null;

    return (
        <div ref={parentRef} className="h-[800px] overflow-auto">
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const startIndex = virtualRow.index * columnsPerRow;
                    const endIndex = Math.min(startIndex + columnsPerRow, exercises.length);
                    const rowExercises = exercises.slice(startIndex, endIndex);

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                                paddingBottom: '1.25rem', // gap-5 equivalente
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-1 h-full">
                                {rowExercises.map((exercise) => (
                                    <div
                                        key={exercise.exercise_id}
                                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group flex flex-col min-h-[400px]"
                                    >
                                        {/* Imagen/GIF del ejercicio */}
                                        {(() => {
                                            const imageUrl = getExerciseImageUrl(exercise);
                                            return (
                                                <div 
                                                    className={`relative w-full h-48 bg-gradient-to-br from-blue-500/20 to-pink-500/20 dark:from-blue-600/30 dark:to-pink-600/30 overflow-hidden flex-shrink-0 ${imageUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (imageUrl) {
                                                            onViewGif(displayName(exercise), exercise);
                                                        }
                                                    }}
                                                >
                                                    {imageUrl ? (
                                                        <OptimizedImage
                                                            src={imageUrl}
                                                            alt={displayName(exercise)}
                                                    className="w-full h-full object-cover pointer-events-none"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-xs font-medium text-center px-2 leading-tight text-gray-600 dark:text-gray-400">
                                                        {displayName(exercise).substring(0, 30)}
                                                        {displayName(exercise).length > 30 ? '...' : ''}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg">
                                                    {exercise.category}
                                                </span>
                                            </div>
                                        </div>
                                        );
                                    })()}

                                        {/* Información del ejercicio */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-lg">
                                                {displayName(exercise)}
                                            </h3>
                                            {exercise.name_es && exercise.name !== exercise.name_es && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                    {exercise.name}
                                                </p>
                                            )}
                                            <button
                                                onClick={() => onAddToRoutine(exercise)}
                                                className="w-full mt-auto px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Agregar a Rutina
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ExercisesPage = () => {
    const toast = useToastStore();
    const user = useUserStore((state) => state.user);
    const isAdmin = useUserStore((state) => state.isAdmin());
    const isCoach = useUserStore((state) => state.isCoach());
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showAddToRoutineModal, setShowAddToRoutineModal] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [routines, setRoutines] = useState([]);
    const [selectedRoutineId, setSelectedRoutineId] = useState(null);
    const [exerciseForm, setExerciseForm] = useState({
        sets: 3,
        reps: 10,
        duration_minutes: null,
        weight_kg: 0,
        day_of_week: null
    });
    const [loadingRoutines, setLoadingRoutines] = useState(false);
    const [addingExercise, setAddingExercise] = useState(false);
    const [showExerciseGif, setShowExerciseGif] = useState(null);
    const [exerciseGifUrl, setExerciseGifUrl] = useState(null);
    const [exerciseVideoUrl, setExerciseVideoUrl] = useState(null);
    const [videoError, setVideoError] = useState(false);
    const [loadingExerciseGif, setLoadingExerciseGif] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);

    const exercisesPerPage = 24;

    const fetchExercises = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/exercises?page=${currentPage}&limit=${exercisesPerPage}`);
            const data = response.data;
            setExercises(data.exercises || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            logger.error('Error fetching exercises:', error);
            toast.error('Error al cargar los ejercicios');
        } finally {
            setLoading(false);
        }
    }, [currentPage, exercisesPerPage]);

    const fetchRoutines = useCallback(async () => {
        try {
            setLoadingRoutines(true);
            const response = await api.get('/routines');
            setRoutines(response.data.routines || []);
        } catch (error) {
            logger.error('Error fetching routines:', error);
            toast.error('Error al cargar las rutinas');
        } finally {
            setLoadingRoutines(false);
        }
    }, []);

    const filterExercises = useCallback(async () => {
        let filtered = [];

        // Si hay una búsqueda activa (más de 2 caracteres), usar el endpoint de búsqueda
        if (searchQuery.trim().length >= 2) {
            try {
                const response = await api.get(`/exercises/search?name=${encodeURIComponent(searchQuery.trim())}`);
                filtered = response.data?.exercises || [];
            } catch (error) {
                logger.error('Error searching exercises:', error);
                // Si falla la búsqueda, usar los ejercicios cargados como fallback
                filtered = [...exercises];
            }
        } else if (selectedMuscleGroup !== 'all') {
            // Si hay un grupo muscular seleccionado, cargar todos los ejercicios de ese grupo
            try {
                const response = await api.get(`/exercises/by-muscle-group?group=${selectedMuscleGroup}`);
                filtered = response.data?.exercises || [];
            } catch (error) {
                logger.error('Error filtering by muscle group:', error);
                filtered = [];
            }
        } else {
            // Si no hay búsqueda ni grupo muscular, usar los ejercicios cargados
            filtered = [...exercises];
        }

        // Filtrar por categoría (solo si no estamos usando búsqueda, ya que la búsqueda ya filtra)
        if (selectedCategory !== 'Todos' && searchQuery.trim().length < 2) {
            filtered = filtered.filter(exercise => exercise.category === selectedCategory);
        } else if (selectedCategory !== 'Todos' && searchQuery.trim().length >= 2) {
            // Si hay búsqueda, también filtrar por categoría
            filtered = filtered.filter(exercise => exercise.category === selectedCategory);
        }

        setFilteredExercises(filtered);
    }, [exercises, searchQuery, selectedCategory, selectedMuscleGroup]);

    // Cargar ejercicios
    useEffect(() => {
        fetchExercises();
        if (showAddToRoutineModal) {
            fetchRoutines();
        }
    }, [currentPage, showAddToRoutineModal, fetchExercises, fetchRoutines]);

    // Filtrar ejercicios cuando cambian los filtros
    useEffect(() => {
        filterExercises();
    }, [filterExercises]);

    // Debug: Ver cuando cambia el estado del modal
    // Efecto para sincronizar el estado del modal (útil para debugging si es necesario)
    useEffect(() => {
        // Logs de debug solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
            // Puedes descomentar esto si necesitas debuggear el estado del modal
            // console.log('Modal state:', { showExerciseGif, exerciseGifUrl, exerciseVideoUrl, loadingExerciseGif });
        }
    }, [showExerciseGif, exerciseGifUrl, exerciseVideoUrl, loadingExerciseGif]);

    const handleAddToRoutine = (exercise) => {
        setSelectedExercise(exercise);
        setShowAddToRoutineModal(true);
    };

    const handleAddExerciseToRoutine = async () => {
        if (!selectedRoutineId || !selectedExercise) {
            toast.error('Por favor selecciona una rutina');
            return;
        }

        try {
            setAddingExercise(true);
            
            // Obtener los ejercicios de la rutina para calcular el order_index
            let maxOrder = 0;
            try {
                const routineResponse = await api.get(`/routines/${selectedRoutineId}`);
                const routineData = routineResponse.data;
                const existingExercises = routineData?.exercises || [];
                if (existingExercises.length > 0) {
                    maxOrder = Math.max(...existingExercises.map(ex => ex.order_index || 0));
                }
            } catch (error) {
                logger.error('Error fetching routine exercises:', error);
                // Continuar con order_index = 1 si hay error
            }

            await api.post(`/routines/${selectedRoutineId}/exercises`, {
                exercise_id: selectedExercise.exercise_id,
                sets: exerciseForm.sets,
                reps: exerciseForm.reps,
                duration_minutes: exerciseForm.duration_minutes,
                weight_kg: exerciseForm.weight_kg,
                order_index: maxOrder + 1,
                day_of_week: exerciseForm.day_of_week || null
            });

            toast.success(`Ejercicio "${selectedExercise.name_es || selectedExercise.name}" agregado a la rutina`);
            setShowAddToRoutineModal(false);
            setSelectedExercise(null);
            setSelectedRoutineId(null);
            setExerciseForm({
                sets: 3,
                reps: 10,
                duration_minutes: null,
                weight_kg: 0,
                day_of_week: null
            });
        } catch (error) {
            logger.error('Error adding exercise to routine:', error);
            toast.error(error.response?.data?.error || 'Error al agregar el ejercicio a la rutina');
        } finally {
            setAddingExercise(false);
        }
    };

    const handleViewExerciseGif = async (exerciseName, exercise) => {
        // Establecer el estado inmediatamente
        setShowExerciseGif(exerciseName);
        setIsModalOpen(true);
        setLoadingExerciseGif(true);
        setExerciseGifUrl(null);
        setExerciseVideoUrl(null);
        setVideoError(false);
        
        try {
            // Priorizar video sobre GIF si ambos están disponibles
            let videoUrl = exercise?.video_url || null;
            let gifUrl = exercise?.gif_url || null;
            
            // Filtrar URLs de Giphy
            if (videoUrl && videoUrl.toLowerCase().includes('giphy')) {
                videoUrl = null;
            }
            if (gifUrl && gifUrl.toLowerCase().includes('giphy')) {
                gifUrl = null;
            }
            
            if (videoUrl || gifUrl) {
                // Usar URLs existentes del ejercicio, priorizando video
                setExerciseVideoUrl(videoUrl);
                setExerciseGifUrl(gifUrl);
                setLoadingExerciseGif(false);
                return;
            }
            
            // Si no hay URLs en el ejercicio, buscar desde la API
            const response = await api.get(`/exercises/gif?name=${encodeURIComponent(exerciseName)}`);
            if (response.data) {
                // Filtrar URLs de Giphy de la respuesta
                const responseGifUrl = response.data.gif_url;
                const responseVideoUrl = response.data.video_url;
                
                const filteredGifUrl = responseGifUrl && !responseGifUrl.toLowerCase().includes('giphy') ? responseGifUrl : null;
                const filteredVideoUrl = responseVideoUrl && !responseVideoUrl.toLowerCase().includes('giphy') ? responseVideoUrl : null;
                
                setExerciseGifUrl(filteredGifUrl);
                setExerciseVideoUrl(filteredVideoUrl);
            } else {
                setExerciseGifUrl('https://via.placeholder.com/300x200/4a5568/ffffff?text=Exercise+Demonstration');
            }
        } catch (err) {
            logger.error('Error loading exercise GIF/video:', err);
            setExerciseGifUrl('https://via.placeholder.com/300x200/4a5568/ffffff?text=Exercise+Demonstration');
        } finally {
            setLoadingExerciseGif(false);
        }
    };

    const displayName = (exercise) => {
        return exercise.name_es || exercise.name || 'Sin nombre';
    };

    // Función helper para filtrar URLs de Giphy
    const getExerciseImageUrl = (exercise) => {
        if (!exercise) return null;
        const gifUrl = exercise.gif_url;
        const videoUrl = exercise.video_url;
        
        // Filtrar URLs de Giphy
        const filteredGifUrl = gifUrl && !gifUrl.toLowerCase().includes('giphy') ? gifUrl : null;
        const filteredVideoUrl = videoUrl && !videoUrl.toLowerCase().includes('giphy') ? videoUrl : null;
        
        return filteredGifUrl || filteredVideoUrl || null;
    };

    const handleExerciseCreated = (newExercise) => {
        // Recargar la lista de ejercicios y resetear a la primera página
        setCurrentPage(1);
        fetchExercises();
        // Si hay una búsqueda activa, también recargar los resultados de búsqueda
        if (searchQuery.trim().length >= 2) {
            filterExercises();
        }
        toast.success(`Ejercicio "${newExercise.name}" creado exitosamente`);
    };

    return (
        <AppLayout>
            <PageContainer>
                {/* Header */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
                            Ejercicios
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
                            Explora y agrega ejercicios a tus rutinas
                        </p>
                    </div>
                    {(isAdmin || isCoach) && (
                        <button
                            onClick={() => setShowCreateExerciseModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Ejercicio
                        </button>
                    )}
                </div>

                {/* Filtros y Búsqueda */}
                <div className="mb-8 space-y-4">
                    {/* Barra de búsqueda */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar ejercicios..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-all"
                        />
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-3">
                        {/* Filtro por categoría */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría:</span>
                            <div className="flex gap-2">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                            selectedCategory === category
                                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filtro por grupo muscular */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grupo:</span>
                            <div className="flex gap-2">
                                {MUSCLE_GROUPS.map(group => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedMuscleGroup(group.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                            selectedMuscleGroup === group.id
                                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        <span>{group.icon}</span>
                                        {group.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de ejercicios */}
                {loading ? (
                    <ExercisesPageSkeleton />
                ) : filteredExercises.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No se encontraron ejercicios</p>
                        <p className="text-gray-500 dark:text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                ) : (
                    <>
                        {filteredExercises.length > 20 ? (
                            <VirtualizedExerciseGrid 
                                exercises={filteredExercises}
                                onAddToRoutine={handleAddToRoutine}
                                displayName={displayName}
                                onViewGif={handleViewExerciseGif}
                                getExerciseImageUrl={getExerciseImageUrl}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-1">
                                {filteredExercises.map((exercise) => (
                                <div
                                    key={exercise.exercise_id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group flex flex-col min-h-[400px]"
                                >
                                    {/* Imagen/GIF del ejercicio */}
                                    {(() => {
                                        const imageUrl = getExerciseImageUrl(exercise);
                                        return (
                                            <div 
                                                className={`relative w-full h-48 bg-gradient-to-br from-blue-500/20 to-pink-500/20 dark:from-blue-600/30 dark:to-pink-600/30 overflow-hidden flex-shrink-0 ${imageUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (imageUrl) {
                                                        handleViewExerciseGif(displayName(exercise), exercise);
                                                    }
                                                }}
                                            >
                                                {imageUrl ? (
                                                    <OptimizedImage
                                                        src={imageUrl}
                                                        alt={displayName(exercise)}
                                                className="w-full h-full object-cover pointer-events-none"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-xs font-medium text-center px-2 leading-tight text-gray-600 dark:text-gray-400">
                                                    {displayName(exercise).substring(0, 30)}
                                                    {displayName(exercise).length > 30 ? '...' : ''}
                                                </p>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg">
                                                {exercise.category}
                                            </span>
                                        </div>
                                    </div>
                                    );
                                })()}

                                    {/* Información del ejercicio */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-lg">
                                            {displayName(exercise)}
                                        </h3>
                                        {exercise.name_es && exercise.name !== exercise.name_es && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                {exercise.name}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => handleAddToRoutine(exercise)}
                                            className="w-full mt-auto px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar a Rutina
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Modal para agregar a rutina */}
                <Dialog.Root open={showAddToRoutineModal} onOpenChange={setShowAddToRoutineModal}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed top-0 md:top-1/2 left-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 backdrop-blur-xl bg-white/80 dark:bg-black/80 rounded-t-3xl md:rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-6 md:p-8 max-w-lg w-full md:w-[calc(100%-2rem)] md:mx-4 max-h-[90vh] md:max-h-[90vh] h-[90vh] md:h-auto overflow-y-auto z-50">
                            <Dialog.Title className="text-2xl font-light tracking-tight text-gray-900 dark:text-white mb-2">
                                Agregar a Rutina
                            </Dialog.Title>
                            <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6 font-light">
                                {selectedExercise && `Agregar "${displayName(selectedExercise)}" a una rutina`}
                            </Dialog.Description>

                            {loadingRoutines ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Seleccionar rutina */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Seleccionar Rutina *
                                        </label>
                                        <select
                                            value={selectedRoutineId || ''}
                                            onChange={(e) => setSelectedRoutineId(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Selecciona una rutina</option>
                                            {routines.map(routine => (
                                                <option key={routine.routine_id} value={routine.routine_id}>
                                                    {routine.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Configuración del ejercicio */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Series
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={exerciseForm.sets}
                                                onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Repeticiones
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={exerciseForm.reps}
                                                onChange={(e) => setExerciseForm({ ...exerciseForm, reps: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Dialog.Close asChild>
                                            <button
                                                type="button"
                                                className="flex-1 px-4 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all"
                                                disabled={addingExercise}
                                            >
                                                Cancelar
                                            </button>
                                        </Dialog.Close>
                                        <button
                                            onClick={handleAddExerciseToRoutine}
                                            disabled={!selectedRoutineId || addingExercise}
                                            className="flex-1 px-4 py-3.5 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {addingExercise ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Agregando...
                                                </>
                                            ) : (
                                                'Agregar'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Exercise GIF/Video Modal - Radix UI */}
                <Dialog.Root 
                    open={isModalOpen}
                    onOpenChange={(open) => {
                        setIsModalOpen(open);
                        // Solo cerrar si no está cargando
                        if (!open && !loadingExerciseGif) {
                            setShowExerciseGif(null);
                            setExerciseGifUrl(null);
                            setExerciseVideoUrl(null);
                            setVideoError(false);
                        }
                    }}
                >
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content 
                            className="fixed top-0 md:top-1/2 left-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full md:w-[calc(100%-2rem)] md:mx-4 max-h-[90vh] md:max-h-[90vh] h-[90vh] md:h-auto overflow-y-auto z-50 transition-colors duration-300"
                            onPointerDownOutside={(e) => {
                                // Prevenir cierre accidental durante carga
                                if (loadingExerciseGif) {
                                    e.preventDefault();
                                }
                            }}
                            onEscapeKeyDown={(e) => {
                                // Prevenir cierre con ESC durante carga
                                if (loadingExerciseGif) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 md:px-0 md:py-0 md:border-0 md:static z-10">
                                <Dialog.Title className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6 px-6 md:px-0">Cómo hacer: {showExerciseGif}</Dialog.Title>
                                <Dialog.Description className="sr-only">
                                    Demostración visual de cómo realizar el ejercicio {showExerciseGif}
                                </Dialog.Description>
                            </div>
                            <div className="px-6 md:px-0 pb-6 md:pb-0">
                            {loadingExerciseGif ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (exerciseVideoUrl && exerciseVideoUrl.trim() !== '' && !videoError) ? (
                                <div className="w-full flex justify-center mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                                    <video 
                                        key={exerciseVideoUrl}
                                        src={exerciseVideoUrl} 
                                        controls
                                        autoPlay
                                        muted
                                        playsInline
                                        className="rounded-2xl max-w-full h-auto max-h-96 object-contain"
                                        onError={(e) => {
                                            logger.error('Error loading video:', exerciseVideoUrl);
                                            setVideoError(true);
                                            // Si el video falla, automáticamente se mostrará el GIF si está disponible
                                        }}
                                        onLoadStart={() => {
                                            logger.info('Video loading started:', exerciseVideoUrl);
                                        }}
                                    >
                                        Tu navegador no soporta la reproducción de videos.
                                    </video>
                                </div>
                            ) : (exerciseGifUrl && exerciseGifUrl.trim() !== '') ? (
                                <div className="w-full flex justify-center mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                                    {isAnimatedGif(exerciseGifUrl) ? (
                                        // Real animated GIF - use img directly for animation
                                        <img 
                                            key={exerciseGifUrl}
                                            src={exerciseGifUrl} 
                                            alt={`Cómo hacer ${showExerciseGif}`}
                                            className="rounded-2xl max-w-full h-auto max-h-96 object-contain"
                                            style={{ display: 'block' }}
                                            onError={(e) => {
                                                logger.error('Error loading animated GIF:', exerciseGifUrl);
                                                e.target.style.display = 'none';
                                                const errorDiv = document.createElement('div');
                                                errorDiv.className = 'text-center text-gray-600 dark:text-gray-400 py-12 font-light';
                                                errorDiv.textContent = 'No se pudo cargar la imagen del ejercicio.';
                                                e.target.parentElement?.appendChild(errorDiv);
                                            }}
                                        />
                                    ) : (
                                        // Static image (jpg, png, etc.) - use OptimizedImage for better performance
                                        <OptimizedImage
                                            key={exerciseGifUrl}
                                            src={exerciseGifUrl} 
                                            alt={`Cómo hacer ${showExerciseGif}`}
                                            className="rounded-2xl max-w-full h-auto max-h-96 object-contain"
                                            onError={(e) => {
                                                logger.error('Error loading static image:', exerciseGifUrl);
                                            }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-600 dark:text-gray-400 py-12 font-light">
                                    No hay demostración disponible para este ejercicio.
                                </div>
                            )}

                            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
                                <Dialog.Close asChild>
                                    <button
                                        className="w-full sm:w-auto px-6 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all"
                                        onClick={() => {
                                            setShowExerciseGif(null);
                                            setExerciseGifUrl(null);
                                            setExerciseVideoUrl(null);
                                            setVideoError(false);
                                        }}
                                    >
                                        Cerrar
                                    </button>
                                </Dialog.Close>
                            </div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Modal de Crear Ejercicio */}
                <CreateExerciseModal
                    open={showCreateExerciseModal}
                    onClose={() => setShowCreateExerciseModal(false)}
                    onExerciseCreated={handleExerciseCreated}
                />
            </PageContainer>
        </AppLayout>
    );
};

export default ExercisesPage;

