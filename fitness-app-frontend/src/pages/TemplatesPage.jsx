import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../services/api';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Plus, Dumbbell, Utensils, Trash2, Edit2, AlertCircle, X, Search, Copy, Sparkles, Filter, Users, Calendar } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import useToastStore from '../stores/useToastStore';
import logger from '@/utils/logger';
import VirtualizedList from '../components/VirtualizedList';
import OptimizedImage from '../components/OptimizedImage';
import { useDebounce } from '../hooks/useDebounce';
import AssignTemplateModal from '../components/AssignTemplateModal';
import CreateExerciseModal from '../components/CreateExerciseModal';

const TemplatesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Si viene del dashboard con state, mostrar la pestaña de predefinidas
    const initialTab = location.state?.tab === 'predefined' ? 'predefined' : 'routines';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [routineTemplates, setRoutineTemplates] = useState([]);
    const [predefinedRoutines, setPredefinedRoutines] = useState([]);
    const [dietTemplates, setDietTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [predefinedLoading, setPredefinedLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [filters, setFilters] = useState({ trainingType: '', level: '', frequency: '' });
    const [clients, setClients] = useState([]);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedClientForAssignment, setSelectedClientForAssignment] = useState(null);
    const [templateToAssign, setTemplateToAssign] = useState(null);
    const [showAssignPrompt, setShowAssignPrompt] = useState(false);
    const [assignPromptMessage, setAssignPromptMessage] = useState('');
    const [showScheduleConfigModal, setShowScheduleConfigModal] = useState(false);
    const [selectedTemplateForSchedule, setSelectedTemplateForSchedule] = useState(null);
    const [scheduleConfig, setScheduleConfig] = useState({
        weeks: 4,
        daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
        startDate: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    });
    const toast = useToastStore();

    useEffect(() => {
        if (activeTab === 'predefined') {
            loadPredefinedRoutines();
        } else {
            loadTemplates();
        }
    }, [activeTab, filters]);

    useEffect(() => {
        // Load clients list for assignment functionality
        loadClients();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            setError(null);
            if (activeTab === 'routines') {
                const response = await api.get('/templates/routines');
                setRoutineTemplates(response.data.templates || []);
            } else {
                const response = await api.get('/templates/diets');
                setDietTemplates(response.data.templates || []);
            }
        } catch (error) {
            logger.error('Error cargando plantillas:', error);
            const errorMessage = error.response?.data?.error || 
                error.response?.status === 500 
                    ? 'Error del servidor al cargar las plantillas. Por favor, intenta más tarde.'
                    : 'Error al cargar las plantillas. Por favor, verifica tu conexión.';
            setError(errorMessage);
            toast.error(errorMessage);
            // Establecer arrays vacíos para evitar errores de renderizado
            if (activeTab === 'routines') {
                setRoutineTemplates([]);
            } else {
                setDietTemplates([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadPredefinedRoutines = async () => {
        try {
            setPredefinedLoading(true);
            setError(null);
            const params = {};
            if (filters.trainingType) params.trainingType = filters.trainingType;
            if (filters.level) params.level = filters.level;
            if (filters.frequency) params.frequency = filters.frequency;
            
            logger.info('Cargando rutinas predefinidas con params:', params);
            const response = await api.get('/templates/routines/predefined', { params });
            logger.info('Respuesta de rutinas predefinidas:', { 
                count: response.data?.count, 
                templatesLength: response.data?.templates?.length 
            });
            
            const templates = response.data?.templates || [];
            setPredefinedRoutines(templates);
            
            if (templates.length === 0 && !filters.trainingType && !filters.level && !filters.frequency) {
                logger.warn('No se encontraron rutinas predefinidas sin filtros');
            }
        } catch (error) {
            logger.error('Error cargando rutinas predefinidas:', error);
            const errorMessage = error.response?.data?.error || 
                error.response?.status === 404
                    ? 'No se encontraron rutinas predefinidas. Contacta al administrador.'
                    : 'Error al cargar las rutinas predefinidas. Por favor, intenta más tarde.';
            setError(errorMessage);
            toast.error(errorMessage);
            setPredefinedRoutines([]);
        } finally {
            setPredefinedLoading(false);
        }
    };

    const loadClients = async () => {
        try {
            const response = await api.get('/coach/clients');
            setClients(response.data.clients || []);
        } catch (error) {
            logger.error('Error cargando clientes:', error);
            // Don't show error toast as this is not critical for the page to function
        }
    };

    const handleDuplicatePredefined = async (templateId, templateName) => {
        try {
            const customName = prompt(`¿Qué nombre quieres darle a esta rutina?\n\nRutina original: ${templateName}`, `${templateName} (Copia)`);
            if (!customName) return;

            const response = await api.post(`/templates/routines/predefined/${templateId}/duplicate`, {
                name: customName
            });
            
            const newTemplate = response.data.template;
            
            // Switch to routines tab to show the duplicated routine
            setActiveTab('routines');
            
            // Reload templates to show the new one
            await loadTemplates();
            
            toast.success('Rutina duplicada exitosamente');
            
            // Show assignment prompt if coach has clients
            if (clients.length > 0) {
                setTemplateToAssign(newTemplate);
                setAssignPromptMessage('Rutina copiada exitosamente');
                setShowAssignPrompt(true);
            }
        } catch (error) {
            logger.error('Error duplicando rutina predefinida:', error);
            const errorMessage = error.response?.data?.error || 'Error al duplicar la rutina. Por favor, intenta nuevamente.';
            toast.error(errorMessage);
        }
    };

    const handleAssignPromptResponse = (wantsToAssign) => {
        setShowAssignPrompt(false);
        if (wantsToAssign && templateToAssign && clients.length > 0) {
            // If only one client, assign directly. Otherwise, show client selection
            if (clients.length === 1) {
                setSelectedClientForAssignment(clients[0]);
                setAssignModalOpen(true);
            } else {
                // Show client selection dialog - make sure no client is selected yet
                setSelectedClientForAssignment(null);
                setAssignModalOpen(true);
            }
        } else {
            setTemplateToAssign(null);
            setSelectedClientForAssignment(null);
        }
    };

    const handleClientSelected = (client) => {
        setSelectedClientForAssignment(client);
        // Keep assignModalOpen true so AssignTemplateModal opens
    };

    // Extraer días únicos de la semana de una plantilla
    const extractTemplateDaysOfWeek = (template) => {
        if (!template.exercises) return null;
        
        let exercisesList = [];
        if (template.exercises.exercises && Array.isArray(template.exercises.exercises)) {
            exercisesList = template.exercises.exercises;
        } else if (Array.isArray(template.exercises)) {
            exercisesList = template.exercises;
        }
        
        const uniqueDays = [...new Set(exercisesList
            .map(ex => ex.day_of_week)
            .filter(day => day !== null && day !== undefined))];
        
        return uniqueDays.length > 0 ? uniqueDays : null;
    };

    // Convertir plantilla a rutina activa - abre modal de configuración
    const handleConvertToRoutine = (template) => {
        // Extraer días de la plantilla
        const templateDays = extractTemplateDaysOfWeek(template);
        const defaultDays = templateDays && templateDays.length > 0 ? templateDays : [1, 2, 3, 4, 5];
        
        // Configurar estado inicial
        setSelectedTemplateForSchedule(template);
        setScheduleConfig({
            weeks: 4,
            daysOfWeek: defaultDays,
            startDate: new Date().toISOString().split('T')[0]
        });
        setShowScheduleConfigModal(true);
    };

    // Confirmar creación de rutina con configuración de planificación
    const handleConfirmScheduleConfig = async () => {
        if (!selectedTemplateForSchedule) return;

        try {
            const response = await api.post('/routines/from-template', {
                template_id: selectedTemplateForSchedule.template_id,
                schedule_weeks: scheduleConfig.weeks,
                schedule_days_of_week: scheduleConfig.daysOfWeek,
                schedule_start_date: scheduleConfig.startDate
            });
            
            const newRoutine = response.data.routine;
            
            if (response.data.warnings?.skipped_exercises?.length > 0) {
                toast.warning(`Rutina "${newRoutine.name}" creada, pero ${response.data.warnings.skipped_exercises.length} ejercicio(s) fueron omitidos.`);
            } else {
                toast.success(`Rutina "${newRoutine.name}" creada y planificada correctamente.`);
            }
            
            setShowScheduleConfigModal(false);
            setSelectedTemplateForSchedule(null);
            
            // Opcional: no navegar automáticamente, dejar que el usuario decida
        } catch (error) {
            logger.error('Error convirtiendo plantilla a rutina:', error);
            const errorMessage = error.response?.data?.error || 'Error al convertir la plantilla a rutina. Por favor, intenta nuevamente.';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id, type) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) return;

        try {
            await api.delete(`/templates/${type}/${id}`);
            toast.success('Plantilla eliminada correctamente');
            loadTemplates();
        } catch (error) {
            logger.error('Error eliminando plantilla:', error);
            const errorMessage = error.response?.data?.error || 'Error al eliminar la plantilla. Por favor, intenta nuevamente.';
            toast.error(errorMessage);
        }
    };

    const templates = activeTab === 'routines' ? routineTemplates : dietTemplates;

    return (
        <AppLayout>
            <PageContainer>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Mis Plantillas
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Gestiona tus plantillas de rutinas y dietas
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingTemplate(null);
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Plantilla
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('routines')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'routines'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4" />
                            Mis Rutinas ({routineTemplates.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('predefined')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'predefined'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Rutinas Predefinidas ({predefinedRoutines.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('diets')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'diets'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Utensils className="w-4 h-4" />
                            Dietas ({dietTemplates.length})
                        </div>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 backdrop-blur-xl bg-red-50/60 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-1">
                                    Error al cargar plantillas
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                                    {error}
                                </p>
                                <button
                                    onClick={loadTemplates}
                                    className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-sm hover:shadow-md active:scale-95"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Predefined Routines Section */}
                {activeTab === 'predefined' && (
                    <>
                        {/* Filters */}
                        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de Entrenamiento
                                    </label>
                                    <select
                                        value={filters.trainingType}
                                        onChange={(e) => setFilters({ ...filters, trainingType: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Todos</option>
                                        <option value="strength">Fuerza</option>
                                        <option value="cardio">Cardio</option>
                                        <option value="endurance">Resistencia</option>
                                        <option value="flexibility">Flexibilidad</option>
                                        <option value="hiit">HIIT</option>
                                        <option value="hybrid">Híbrido</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nivel
                                    </label>
                                    <select
                                        value={filters.level}
                                        onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Todos</option>
                                        <option value="beginner">Principiante</option>
                                        <option value="intermediate">Intermedio</option>
                                        <option value="advanced">Avanzado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Días por Semana
                                    </label>
                                    <select
                                        value={filters.frequency}
                                        onChange={(e) => setFilters({ ...filters, frequency: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Todos</option>
                                        <option value="3">3 días</option>
                                        <option value="4">4 días</option>
                                        <option value="5">5 días</option>
                                        <option value="6">6 días</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Predefined Routines Grid */}
                        {predefinedLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
                            </div>
                        ) : predefinedRoutines.length === 0 ? (
                            <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                                <Sparkles className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No se encontraron rutinas predefinidas con los filtros seleccionados.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {predefinedRoutines.map((template) => (
                                    <div
                                        key={template.template_id}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow relative"
                                    >
                                        <div className="absolute top-4 right-4">
                                            <span className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                                                Predefinida
                                            </span>
                                        </div>
                                        <div className="mb-4 pr-16">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                {template.name}
                                            </h3>
                                            {template.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {template.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {template.trainingType && (
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                                    {template.trainingType}
                                                </span>
                                            )}
                                            {template.level && (
                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                                    {template.level}
                                                </span>
                                            )}
                                            {template.frequency && (
                                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                                                    {template.frequency} días/semana
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            {template.exercises?.length || 0} ejercicios
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleConvertToRoutine(template)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Usar como Rutina
                                            </button>
                                            <button
                                                onClick={() => handleDuplicatePredefined(template.template_id, template.name)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Duplicar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Templates Grid */}
                {activeTab !== 'predefined' && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
                            </div>
                        ) : error ? (
                            <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                                <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    No se pudieron cargar las plantillas. Por favor, intenta nuevamente.
                                </p>
                                <button
                                    onClick={loadTemplates}
                                    className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md active:scale-95"
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                                <p className="text-gray-600 dark:text-gray-400">
                                    No hay plantillas. Crea tu primera plantilla.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map((template) => (
                                    <div
                                        key={template.template_id}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                    {template.name}
                                                </h3>
                                                {template.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {template.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConvertToRoutine(template)}
                                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                    title="Usar como rutina activa"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingTemplate(template);
                                                        setModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(template.template_id, activeTab)}
                                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {activeTab === 'routines'
                                                ? `${template.exercises?.length || 0} ejercicios`
                                                : `${template.meals?.length || 0} comidas`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <TemplateModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    template={editingTemplate}
                    type={activeTab}
                    onSuccess={async (createdTemplate) => {
                        await loadTemplates();
                        // If a new template was created (not edited) and coach has clients, show assignment prompt
                        if (!editingTemplate && createdTemplate && clients.length > 0 && activeTab === 'routines') {
                            setTemplateToAssign(createdTemplate);
                            setAssignPromptMessage('Rutina creada exitosamente');
                            setShowAssignPrompt(true);
                        }
                    }}
                />

                {/* Assignment Prompt Dialog */}
                <Dialog.Root open={showAssignPrompt} onOpenChange={(open) => !open && handleAssignPromptResponse(false)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl shadow-xl p-6 w-full max-w-md border border-gray-200/50 dark:border-gray-800/50 z-50">
                            <Dialog.Title className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                {assignPromptMessage || 'Rutina creada exitosamente'}
                            </Dialog.Title>
                            <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
                                ¿Deseas asignarla a algún cliente?
                            </Dialog.Description>
                            <div className="flex gap-3">
                                <Dialog.Close asChild>
                                    <button
                                        onClick={() => handleAssignPromptResponse(false)}
                                        className="flex-1 px-4 py-2 backdrop-blur-sm bg-gray-200/60 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300/60 dark:hover:bg-gray-600/60 transition-all"
                                    >
                                        Más tarde
                                    </button>
                                </Dialog.Close>
                                <button
                                    onClick={() => handleAssignPromptResponse(true)}
                                    className="flex-1 px-4 py-2 backdrop-blur-xl bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all"
                                >
                                    Asignar ahora
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Client Selection Dialog (if multiple clients) */}
                {clients.length > 1 && templateToAssign && (
                    <Dialog.Root open={assignModalOpen && !selectedClientForAssignment} onOpenChange={(open) => {
                        if (!open) {
                            setAssignModalOpen(false);
                            setTemplateToAssign(null);
                        }
                    }}>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto border border-gray-200/50 dark:border-gray-800/50 z-50">
                                <Dialog.Title className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Users className="w-6 h-6" />
                                    Selecciona un cliente
                                </Dialog.Title>
                                <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-4">
                                    Elige el cliente al que deseas asignar la rutina "{templateToAssign?.name}"
                                </Dialog.Description>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {clients.map((client) => (
                                        <button
                                            key={client.id}
                                            onClick={() => handleClientSelected(client)}
                                            className="w-full p-4 text-left backdrop-blur-sm bg-white/60 dark:bg-black/60 rounded-xl border border-gray-200/50 dark:border-gray-800/50 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                                                    {client.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {client.email}
                                                    </div>
                                                    {client.currentWeight && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {client.currentWeight} kg
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Dialog.Close asChild>
                                        <button className="w-full px-4 py-2 backdrop-blur-sm bg-gray-200/60 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300/60 dark:hover:bg-gray-600/60 transition-all">
                                            Cancelar
                                        </button>
                                    </Dialog.Close>
                                </div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                )}

                {/* Assign Template Modal */}
                {selectedClientForAssignment && templateToAssign && (
                    <AssignTemplateModal
                        open={assignModalOpen && !!selectedClientForAssignment}
                        onOpenChange={(open) => {
                            if (!open) {
                                setAssignModalOpen(false);
                                setSelectedClientForAssignment(null);
                                setTemplateToAssign(null);
                            }
                        }}
                        clientId={selectedClientForAssignment.id}
                        clientEmail={selectedClientForAssignment.email}
                        type="routine"
                        preSelectedTemplateId={templateToAssign.template_id}
                        onSuccess={() => {
                            setAssignModalOpen(false);
                            setSelectedClientForAssignment(null);
                            setTemplateToAssign(null);
                            loadTemplates();
                        }}
                    />
                )}

                {/* Modal de configuración de planificación */}
                <Dialog.Root open={showScheduleConfigModal} onOpenChange={setShowScheduleConfigModal}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed top-0 md:top-1/2 left-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 md:p-8 max-w-md w-full md:w-[calc(100%-2rem)] md:mx-4 max-h-[90vh] md:max-h-[90vh] h-[90vh] md:h-auto overflow-y-auto z-50 transition-colors duration-300">
                            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pb-4 md:pb-0 md:border-0 md:static z-10">
                                <Dialog.Title className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary-500" />
                                    Configurar Planificación
                                </Dialog.Title>
                                <Dialog.Description className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
                                    Configura cómo quieres planificar la rutina "{selectedTemplateForSchedule?.name}"
                                </Dialog.Description>
                            </div>
                            
                            <div className="px-0 md:px-0 pb-6 md:pb-0 mt-4">
                                <div className="space-y-6">
                                    {/* Número de semanas */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Número de semanas
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={scheduleConfig.weeks}
                                            onChange={(e) => setScheduleConfig({
                                                ...scheduleConfig,
                                                weeks: parseInt(e.target.value) || 4
                                            })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-colors duration-300"
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            La rutina se planificará para las próximas {scheduleConfig.weeks} semana(s)
                                        </p>
                                    </div>

                                    {/* Días de la semana */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Días de la semana
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { value: 0, label: 'Dom' },
                                                { value: 1, label: 'Lun' },
                                                { value: 2, label: 'Mar' },
                                                { value: 3, label: 'Mié' },
                                                { value: 4, label: 'Jue' },
                                                { value: 5, label: 'Vie' },
                                                { value: 6, label: 'Sáb' }
                                            ].map((day) => (
                                                <label
                                                    key={day.value}
                                                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={scheduleConfig.daysOfWeek.includes(day.value)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setScheduleConfig({
                                                                    ...scheduleConfig,
                                                                    daysOfWeek: [...scheduleConfig.daysOfWeek, day.value].sort()
                                                                });
                                                            } else {
                                                                setScheduleConfig({
                                                                    ...scheduleConfig,
                                                                    daysOfWeek: scheduleConfig.daysOfWeek.filter(d => d !== day.value)
                                                                });
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {day.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {scheduleConfig.daysOfWeek.length === 0 && (
                                            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                                                Selecciona al menos un día
                                            </p>
                                        )}
                                    </div>

                                    {/* Fecha de inicio */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Fecha de inicio (opcional)
                                        </label>
                                        <input
                                            type="date"
                                            value={scheduleConfig.startDate}
                                            onChange={(e) => setScheduleConfig({
                                                ...scheduleConfig,
                                                startDate: e.target.value
                                            })}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-colors duration-300"
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Si no se especifica, se usará la fecha actual
                                        </p>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowScheduleConfigModal(false);
                                            setSelectedTemplateForSchedule(null);
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmScheduleConfig}
                                        disabled={scheduleConfig.daysOfWeek.length === 0}
                                        className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Crear y Planificar
                                    </button>
                                </div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </PageContainer>
        </AppLayout>
    );
};

const TemplateModal = ({ open, onOpenChange, template, type, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [exercises, setExercises] = useState([]);
    const [meals, setMeals] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (template) {
                // Cargar datos de la plantilla cuando se abre el modal
                setName(template.name || '');
                setDescription(template.description || '');
                setExercises(template.exercises || []);
                setMeals(template.meals || []);
            } else {
                // Resetear formulario cuando se crea una nueva plantilla
                setName('');
                setDescription('');
                setExercises([]);
                setMeals([]);
            }
        } else {
            // Resetear cuando se cierra el modal
            setName('');
            setDescription('');
            setExercises([]);
            setMeals([]);
        }
    }, [template, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = type === 'routines'
                ? { name, description, exercises: exercises.length > 0 ? exercises : [] }
                : { name, description, meals: meals.length > 0 ? meals : [] };

            let createdTemplate = null;
            if (template) {
                await api.put(`/templates/${type}/${template.template_id}`, data);
            } else {
                const response = await api.post(`/templates/${type}`, data);
                createdTemplate = response.data.template || response.data;
            }

            // Cerrar el modal primero
            onOpenChange(false);
            
            // Llamar onSuccess después de un pequeño delay para asegurar que el modal se cierre
            setTimeout(() => {
                onSuccess(createdTemplate);
            }, 100);
            
            useToastStore.getState().success(template ? 'Plantilla actualizada correctamente' : 'Plantilla creada correctamente');
        } catch (error) {
            logger.error('Error guardando plantilla:', error);
            const errorMessage = error.response?.data?.error || 'Error al guardar la plantilla. Por favor, intenta nuevamente.';
            useToastStore.getState().error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed top-0 md:top-1/2 left-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-xl p-6 w-full md:w-[calc(100%-2rem)] md:mx-4 max-w-2xl max-h-[90vh] md:max-h-[90vh] h-[90vh] md:h-auto overflow-y-auto z-50 border border-gray-200 dark:border-gray-800">
                    <Dialog.Title className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                        {template ? 'Editar' : 'Nueva'} Plantilla de {type === 'routines' ? 'Rutina' : 'Dieta'}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {type === 'routines' ? (
                            <ExerciseListBuilder exercises={exercises} setExercises={setExercises} />
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Comidas (JSON)
                                </label>
                                <textarea
                                    value={JSON.stringify(meals, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            setMeals(JSON.parse(e.target.value));
                                        } catch {
                                            // Ignorar errores de parsing
                                        }
                                    }}
                                    rows={10}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                    placeholder='[{"meal_type": "Desayuno", "foods": [{"food_id": 1, "quantity_grams": 100}]}]'
                                />
                            </div>
                        )}

                        <div className="flex gap-3 justify-end pt-4">
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Guardando...' : (template ? 'Actualizar' : 'Crear')}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

// Componente para construir la lista de ejercicios visualmente
const ExerciseListBuilder = ({ exercises, setExercises }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseDetails, setExerciseDetails] = useState({}); // Cache de detalles de ejercicios
    const [exerciseForm, setExerciseForm] = useState({
        sets: '',
        reps: '',
        weight_kg: '',
        duration_minutes: '',
        day_of_week: null
    });
    const [editingIndex, setEditingIndex] = useState(null);
    const [editForm, setEditForm] = useState({
        sets: '',
        reps: '',
        weight_kg: '',
        duration_minutes: '',
        day_of_week: null
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Memoizar searchExercises para evitar recreaciones
    const searchExercises = useCallback(async (query) => {
        try {
            setLoading(true);
            const response = await api.get(`/exercises/search?name=${encodeURIComponent(query)}`);
            const exercises = response.data?.exercises || [];
            setSearchResults(exercises);
        } catch (error) {
            logger.error('Error buscando ejercicios:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoizar loadExerciseDetails para evitar recreaciones
    const loadExerciseDetails = useCallback(async () => {
        const exerciseIds = exercises
            .map(ex => ex.exercise_id)
            .filter(id => id && !exerciseDetails[id]);

        if (exerciseIds.length === 0) return;

        try {
            // Cargar ejercicios específicos por sus IDs usando el nuevo endpoint
            const idsParam = exerciseIds.join(',');
            const response = await api.get(`/exercises/by-ids?ids=${idsParam}`);
            const foundExercises = response.data?.exercises || [];
            
            // Crear un mapa de ejercicios por ID
            const newDetails = {};
            foundExercises.forEach(exercise => {
                newDetails[exercise.exercise_id] = exercise;
            });
            
            if (Object.keys(newDetails).length > 0) {
                setExerciseDetails(prev => ({ ...prev, ...newDetails }));
            }
        } catch (error) {
            logger.error('Error cargando detalles de ejercicios:', error);
        }
    }, [exercises, exerciseDetails]);

    // Cargar detalles de ejercicios cuando se monta el componente o cambian los ejercicios
    useEffect(() => {
        loadExerciseDetails();
    }, [loadExerciseDetails]);

    // Búsqueda de ejercicios
    useEffect(() => {
        if (debouncedSearchQuery.length >= 2) {
            searchExercises(debouncedSearchQuery);
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchQuery, searchExercises]);

    const handleExerciseSelect = (exercise) => {
        setSelectedExercise(exercise);
        setShowAddForm(true);
        setSearchQuery(exercise.name);
        setSearchResults([]);
    };

    const handleExerciseCreated = (newExercise) => {
        // Seleccionar automáticamente el ejercicio recién creado
        handleExerciseSelect(newExercise);
        setShowCreateModal(false);
    };

    const handleAddExercise = () => {
        if (!selectedExercise) {
            useToastStore.getState().error('Por favor selecciona un ejercicio');
            return;
        }

        const sets = parseInt(exerciseForm.sets) || null;
        const reps = parseInt(exerciseForm.reps) || null;
        const weight_kg = parseFloat(exerciseForm.weight_kg) || null;
        const duration_minutes = parseFloat(exerciseForm.duration_minutes) || null;
        const day_of_week = exerciseForm.day_of_week !== null && exerciseForm.day_of_week !== '' 
            ? parseInt(exerciseForm.day_of_week) 
            : null;

        if (!sets && !duration_minutes) {
            useToastStore.getState().error('Debes especificar al menos sets o duración');
            return;
        }

        const exerciseId = selectedExercise.exercise_id || selectedExercise.id;
        const newExercise = {
            exercise_id: exerciseId,
            sets: sets,
            reps: reps,
            weight_kg: weight_kg,
            duration_minutes: duration_minutes,
            day_of_week: day_of_week
        };

        // Guardar detalles del ejercicio en cache
        setExerciseDetails(prev => ({
            ...prev,
            [exerciseId]: selectedExercise
        }));

        setExercises([...exercises, newExercise]);
        
        // Reset form
        setSelectedExercise(null);
        setShowAddForm(false);
        setSearchQuery('');
        setExerciseForm({
            sets: '',
            reps: '',
            weight_kg: '',
            duration_minutes: '',
            day_of_week: null
        });
    };

    const handleRemoveExercise = (index) => {
        const newExercises = exercises.filter((_, i) => i !== index);
        setExercises(newExercises);
    };

    const handleEditExercise = (index) => {
        const exercise = exercises[index];
        setEditingIndex(index);
        setEditForm({
            sets: exercise.sets || '',
            reps: exercise.reps || '',
            weight_kg: exercise.weight_kg || '',
            duration_minutes: exercise.duration_minutes || '',
            day_of_week: exercise.day_of_week !== null && exercise.day_of_week !== undefined ? exercise.day_of_week : null
        });
    };

    const handleSaveEdit = () => {
        if (editingIndex === null) return;

        const exercise = exercises[editingIndex];
        const updatedExercises = [...exercises];
        updatedExercises[editingIndex] = {
            ...exercise,
            sets: editForm.sets ? parseInt(editForm.sets) : null,
            reps: editForm.reps ? parseInt(editForm.reps) : null,
            weight_kg: editForm.weight_kg ? parseFloat(editForm.weight_kg) : null,
            duration_minutes: editForm.duration_minutes ? parseFloat(editForm.duration_minutes) : null,
            day_of_week: editForm.day_of_week !== null && editForm.day_of_week !== '' 
                ? parseInt(editForm.day_of_week) 
                : null
        };
        setExercises(updatedExercises);
        setEditingIndex(null);
        setEditForm({
            sets: '',
            reps: '',
            weight_kg: '',
            duration_minutes: '',
            day_of_week: null
        });
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditForm({
            sets: '',
            reps: '',
            weight_kg: '',
            duration_minutes: '',
            day_of_week: null
        });
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ejercicios
            </label>

            {/* Lista de ejercicios agregados */}
            {exercises.length > 0 && (
                <div className="mb-4 space-y-2">
                    {exercises.map((exercise, index) => {
                        const exerciseDetail = exerciseDetails[exercise.exercise_id];
                        const exerciseName = exerciseDetail?.name || `Ejercicio ID: ${exercise.exercise_id}`;
                        const exerciseCategory = exerciseDetail?.category || '';
                        const isEditing = editingIndex === index;

                        if (isEditing) {
                            return (
                                <div
                                    key={index}
                                    className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-primary-500 dark:border-primary-400"
                                >
                                    <div className="mb-3">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                            {exerciseName}
                                        </div>
                                        {exerciseCategory && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {exerciseCategory}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Sets
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={editForm.sets}
                                                onChange={(e) => setEditForm({ ...editForm, sets: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Repeticiones
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={editForm.reps}
                                                onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Peso (kg)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={editForm.weight_kg}
                                                onChange={(e) => setEditForm({ ...editForm, weight_kg: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Duración (min)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={editForm.duration_minutes}
                                                onChange={(e) => setEditForm({ ...editForm, duration_minutes: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Día de la semana (opcional)
                                        </label>
                                        <select
                                            value={editForm.day_of_week !== null ? editForm.day_of_week : ''}
                                            onChange={(e) => setEditForm({ 
                                                ...editForm, 
                                                day_of_week: e.target.value === '' ? null : parseInt(e.target.value) 
                                            })}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                        >
                                            <option value="">Todos los días</option>
                                            <option value="0">Domingo</option>
                                            <option value="1">Lunes</option>
                                            <option value="2">Martes</option>
                                            <option value="3">Miércoles</option>
                                            <option value="4">Jueves</option>
                                            <option value="5">Viernes</option>
                                            <option value="6">Sábado</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveEdit}
                                            className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {exerciseName}
                                    </div>
                                    {exerciseCategory && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            {exerciseCategory}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap gap-2">
                                        {exercise.day_of_week !== null && exercise.day_of_week !== undefined && (
                                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 rounded font-medium">
                                                {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][exercise.day_of_week]}
                                            </span>
                                        )}
                                        {exercise.sets && (
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                                                {exercise.sets} sets
                                            </span>
                                        )}
                                        {exercise.reps && (
                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded">
                                                {exercise.reps} reps
                                            </span>
                                        )}
                                        {exercise.weight_kg && (
                                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                                                {exercise.weight_kg}kg
                                            </span>
                                        )}
                                        {exercise.duration_minutes && (
                                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                                                {exercise.duration_minutes}min
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEditExercise(index)}
                                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExercise(index)}
                                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Botón para agregar ejercicio */}
            {!showAddForm && (
                <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Agregar Ejercicio
                </button>
            )}

            {/* Formulario para agregar ejercicio */}
            {showAddForm && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    {/* Búsqueda de ejercicio */}
                    <div className="relative mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Buscar Ejercicio
                            </label>
                            {!selectedExercise && (
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Crear Nuevo
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar ejercicio (ej: Push up, Squat)"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (selectedExercise && e.target.value !== selectedExercise.name) {
                                        setSelectedExercise(null);
                                    }
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Dropdown de resultados */}
                        {searchResults.length > 0 && searchQuery.length >= 2 && !selectedExercise && (
                            <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                                <VirtualizedList
                                    items={searchResults}
                                    itemHeight={80}
                                    className="max-h-60"
                                    renderItem={(exercise) => (
                                        <button
                                            key={exercise.exercise_id || exercise.id}
                                            type="button"
                                            onClick={() => handleExerciseSelect(exercise)}
                                            className="w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-pink-500/20 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                                {exercise.gif_url || exercise.video_url ? (
                                                    <OptimizedImage
                                                        src={exercise.gif_url || exercise.video_url}
                                                        alt={exercise.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                        <Dumbbell className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate text-gray-900 dark:text-white">
                                                    {exercise.name}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {exercise.category}
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                />
                            </div>
                        )}

                        {loading && (
                            <div className="absolute right-3 top-10">
                                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Ejercicio seleccionado y formulario */}
                    {selectedExercise && (
                        <div className="space-y-4">
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {selectedExercise.name}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {selectedExercise.category}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedExercise(null);
                                            setSearchQuery('');
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Campos del ejercicio */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Sets
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={exerciseForm.sets}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                        placeholder="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Repeticiones
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={exerciseForm.reps}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                        placeholder="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Peso (kg)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={exerciseForm.weight_kg}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, weight_kg: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                        placeholder="20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Duración (min)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={exerciseForm.duration_minutes}
                                        onChange={(e) => setExerciseForm({ ...exerciseForm, duration_minutes: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                        placeholder="5"
                                    />
                                </div>
                            </div>

                            {/* Selector de día de la semana */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Día de la semana (opcional)
                                </label>
                                <select
                                    value={exerciseForm.day_of_week !== null ? exerciseForm.day_of_week : ''}
                                    onChange={(e) => setExerciseForm({ 
                                        ...exerciseForm, 
                                        day_of_week: e.target.value === '' ? null : parseInt(e.target.value) 
                                    })}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                >
                                    <option value="">Todos los días</option>
                                    <option value="0">Domingo</option>
                                    <option value="1">Lunes</option>
                                    <option value="2">Martes</option>
                                    <option value="3">Miércoles</option>
                                    <option value="4">Jueves</option>
                                    <option value="5">Viernes</option>
                                    <option value="6">Sábado</option>
                                </select>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setSelectedExercise(null);
                                        setSearchQuery('');
                                        setExerciseForm({
                                            sets: '',
                                            reps: '',
                                            weight_kg: '',
                                            duration_minutes: ''
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddExercise}
                                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Crear Ejercicio */}
            <CreateExerciseModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onExerciseCreated={handleExerciseCreated}
            />

            {/* Resumen de la rutina por días */}
            {exercises.length > 0 && <RoutineSummary exercises={exercises} exerciseDetails={exerciseDetails} />}
        </div>
    );
};

// Componente de resumen de rutina organizado por días
const RoutineSummary = ({ exercises, exerciseDetails }) => {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    // Organizar ejercicios por día
    const exercisesByDay = {};
    const exercisesWithoutDay = [];

    exercises.forEach((exercise, index) => {
        const exerciseDetail = exerciseDetails[exercise.exercise_id];
        const exerciseName = exerciseDetail?.name || `Ejercicio ID: ${exercise.exercise_id}`;
        const exerciseCategory = exerciseDetail?.category || '';

        const exerciseInfo = {
            ...exercise,
            name: exerciseName,
            category: exerciseCategory,
            index
        };

        if (exercise.day_of_week !== null && exercise.day_of_week !== undefined) {
            if (!exercisesByDay[exercise.day_of_week]) {
                exercisesByDay[exercise.day_of_week] = [];
            }
            exercisesByDay[exercise.day_of_week].push(exerciseInfo);
        } else {
            exercisesWithoutDay.push(exerciseInfo);
        }
    });

    const hasExercisesByDay = Object.keys(exercisesByDay).length > 0;
    const hasExercisesWithoutDay = exercisesWithoutDay.length > 0;

    if (!hasExercisesByDay && !hasExercisesWithoutDay) {
        return null;
    }

    return (
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-blue-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary-500" />
                Resumen de la Rutina
            </h3>

            <div className="space-y-4">
                {/* Ejercicios por día */}
                {hasExercisesByDay && (
                    <div className="space-y-3">
                        {daysOfWeek.map((dayName, dayIndex) => {
                            const dayExercises = exercisesByDay[dayIndex];
                            if (!dayExercises || dayExercises.length === 0) return null;

                            return (
                                <div
                                    key={dayIndex}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                                >
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                        {dayName}
                                    </h4>
                                    <div className="space-y-2">
                                        {dayExercises.map((exercise, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start justify-between text-sm bg-gray-50 dark:bg-gray-900 rounded p-2"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {exercise.name}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap gap-1">
                                                        {exercise.sets && (
                                                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">
                                                                {exercise.sets} sets
                                                            </span>
                                                        )}
                                                        {exercise.reps && (
                                                            <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                                                                {exercise.reps} reps
                                                            </span>
                                                        )}
                                                        {exercise.weight_kg && (
                                                            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">
                                                                {exercise.weight_kg}kg
                                                            </span>
                                                        )}
                                                        {exercise.duration_minutes && (
                                                            <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded text-xs">
                                                                {exercise.duration_minutes}min
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Ejercicios sin día asignado */}
                {hasExercisesWithoutDay && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                            Todos los días / Sin día específico
                        </h4>
                        <div className="space-y-2">
                            {exercisesWithoutDay.map((exercise, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start justify-between text-sm bg-gray-50 dark:bg-gray-900 rounded p-2"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {exercise.name}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap gap-1">
                                            {exercise.sets && (
                                                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">
                                                    {exercise.sets} sets
                                                </span>
                                            )}
                                            {exercise.reps && (
                                                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                                                    {exercise.reps} reps
                                                </span>
                                            )}
                                            {exercise.weight_kg && (
                                                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">
                                                    {exercise.weight_kg}kg
                                                </span>
                                            )}
                                            {exercise.duration_minutes && (
                                                <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded text-xs">
                                                    {exercise.duration_minutes}min
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estadísticas */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div>
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {exercises.length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Ejercicios
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {Object.keys(exercisesByDay).length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Días con ejercicios
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Total sets
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {exercises.reduce((sum, ex) => sum + (parseFloat(ex.duration_minutes) || 0), 0).toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Min totales
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplatesPage;

