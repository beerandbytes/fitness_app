import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import ModernRoutineCard from '../components/ModernRoutineCard';
import EmptyState from '../components/EmptyState';
import { EmptyRoutinesIllustration } from '../components/EmptyStateIllustrations';
import ConfirmDialog from '../components/ConfirmDialog';
import { RoutinesPageSkeleton } from '../components/RoutinesPageSkeleton';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import api from '../services/api';
import logger from '../utils/logger';
import { routineSchema } from '../utils/validationSchemas';
import { ClipboardList, LayoutTemplate, Dumbbell } from 'lucide-react';
import useToastStore from '../stores/useToastStore';
import { useOptimisticUpdate, createListOptimisticUpdate } from '../hooks/useOptimisticUpdate';

const RoutinesPage = () => {
    const toast = useToastStore();
    const [routines, setRoutines] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, routineId: null, routineName: '' });
    const [deleting, setDeleting] = useState(false);
    const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(routineSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    const fetchRoutines = async () => {
        try {
            setLoading(true);
            const response = await api.get('/routines');
            setRoutines(response.data.routines || []);
        } catch (err) {
            logger.error('Error fetching routines:', err);
            setError('Error al cargar las rutinas.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const response = await api.get('/routines/templates');
            setTemplates(response.data.templates || []);
        } catch (err) {
            logger.error('Error fetching templates:', err);
            // Non-blocking error for main routines flow
        } finally {
            setLoadingTemplates(false);
        }
    };

    useEffect(() => {
        fetchRoutines();
    }, []);

    const handleTabChange = (value) => {
        if (value === 'templates' && templates.length === 0) {
            fetchTemplates();
        }
    };

    const { execute: executeOptimistic } = useOptimisticUpdate({
        successMessage: 'Rutina creada correctamente',
        errorMessage: 'Error al crear la rutina',
    });

    const onSubmit = async (data) => {
        const newRoutine = {
            routine_id: Date.now(), // Temporal ID para optimistic update
            name: data.name,
            description: data.description,
            created_at: new Date().toISOString(),
        };

        const optimisticUpdate = createListOptimisticUpdate(setRoutines, newRoutine, 'add');

        try {
            const result = await executeOptimistic(
                optimisticUpdate,
                async () => {
                    const response = await api.post('/routines', data);
                    return response.data.routine;
                }
            );

            // Reemplazar el temporal con el real
            setRoutines(prev => prev.map(r =>
                r.routine_id === newRoutine.routine_id ? result : r
            ));

            setShowCreateModal(false);
            reset();
        } catch (err) {
            logger.error('Error creating routine:', err);
            throw err;
        }
    };

    const handleCreateFromTemplate = async (template) => {
        if (creatingFromTemplate) return;

        try {
            setCreatingFromTemplate(true);
            const response = await api.post('/routines/from-template', {
                template_id: template.template_id
            });

            toast.showToast({
                type: 'success',
                title: 'Rutina creada',
                message: `Rutina "${template.name}" creada exitosamente a partir de la plantilla.`
            });

            // Refresh routines to show the new one and switch tab
            await fetchRoutines();

            // Optional: Switch back to 'routines' tab programmatically if we had a ref to the tabs,
            // but for now user can switch manually to see their new routine.

        } catch (err) {
            logger.error('Error creating routine from template:', err);
            toast.showToast({
                type: 'error',
                title: 'Error',
                message: 'No se pudo crear la rutina desde la plantilla.'
            });
        } finally {
            setCreatingFromTemplate(false);
        }
    };

    const handleDeleteClick = (routineId, routineName) => {
        setDeleteConfirm({ open: true, routineId, routineName });
    };

    const { execute: executeDeleteOptimistic } = useOptimisticUpdate({
        successMessage: `Rutina eliminada correctamente`,
        errorMessage: 'Error al eliminar la rutina',
    });

    const handleDeleteConfirm = async () => {
        const { routineId, routineName } = deleteConfirm;
        const routineToDelete = routines.find(r => r.routine_id === routineId);

        if (!routineToDelete) return;

        const optimisticUpdate = createListOptimisticUpdate(setRoutines, routineToDelete, 'remove');
        setDeleting(true);

        try {
            await executeDeleteOptimistic(
                optimisticUpdate,
                async () => {
                    await api.delete(`/routines/${routineId}`);
                }
            );
            setDeleteConfirm({ open: false, routineId: null, routineName: '' });
        } catch (err) {
            logger.error('Error deleting routine:', err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AppLayout>
            <PageContainer>
                {/* Header Minimalista */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
                            Rutinas
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
                            Gestiona tus entrenamientos personalizados
                        </p>
                    </div>
                    <button
                        className="px-6 py-3.5 bg-blue-600 dark:bg-blue-500 text-white rounded-full font-medium hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl shadow-blue-600/20"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Rutina
                    </button>
                </div>

                <Tabs.Root defaultValue="routines" onValueChange={handleTabChange} className="w-full">
                    <Tabs.List className="flex border-b border-gray-200 dark:border-gray-800 mb-8 w-full overflow-x-auto">
                        <Tabs.Trigger
                            value="routines"
                            className="flex items-center gap-2 px-6 py-3 text-lg font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 transition-all outline-none"
                        >
                            <Dumbbell className="w-5 h-5" />
                            Mis Rutinas
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="templates"
                            className="flex items-center gap-2 px-6 py-3 text-lg font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 transition-all outline-none"
                        >
                            <LayoutTemplate className="w-5 h-5" />
                            Plantillas
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="routines" className="outline-none">
                        {loading ? (
                            <RoutinesPageSkeleton />
                        ) : error ? (
                            <div className="backdrop-blur-xl bg-red-50/60 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-3xl p-6 text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        ) : routines.length === 0 ? (
                            <EmptyState
                                IllustrationComponent={EmptyRoutinesIllustration}
                                title="No tienes rutinas creadas"
                                description="Comienza creando tu primera rutina de entrenamiento para organizar tus ejercicios y alcanzar tus objetivos."
                                actionLabel="Crear mi primera rutina"
                                actionOnClick={() => setShowCreateModal(true)}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {routines.map((routine) => (
                                    <ModernRoutineCard
                                        key={routine.routine_id}
                                        routine={routine}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                    <Tabs.Content value="templates" className="outline-none">
                        {loadingTemplates ? (
                            <RoutinesPageSkeleton />
                        ) : templates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
                                    <LayoutTemplate className="w-12 h-12 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No hay plantillas disponibles
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Por el momento no hay plantillas predefinidas. Vuelve más tarde o crea tu propia rutina personalizada.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {templates.map((template) => (
                                    <ModernRoutineCard
                                        key={template.template_id}
                                        routine={{ ...template, isTemplate: true }}
                                        onUnlink={() => handleCreateFromTemplate(template)}
                                    // We reuse onUnlink prop or repurpose components props to pass the action
                                    // But better to check how ModernRoutineCard handles actions.
                                    // Assuming we can customize actions or it handles "isTemplate" prop if we add it. 
                                    // Let's modify ModernRoutineCard next to handle isTemplate mode properly
                                    />
                                ))}
                            </div>
                        )}
                    </Tabs.Content>
                </Tabs.Root>

                {/* Create Routine Modal - Radix UI */}
                <Dialog.Root open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed top-0 md:top-1/2 left-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 backdrop-blur-xl bg-white/80 dark:bg-black/80 rounded-t-3xl md:rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-6 md:p-8 max-w-lg w-full md:w-[calc(100%-2rem)] md:mx-4 max-h-[90vh] md:max-h-[90vh] h-[90vh] md:h-auto overflow-y-auto z-50 transition-all duration-300">
                            <Dialog.Title className="text-2xl font-light tracking-tight text-gray-900 dark:text-white mb-2">Nueva Rutina</Dialog.Title>
                            <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-8 font-light">
                                Define los detalles de tu nueva rutina
                            </Dialog.Description>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Rutina de Fuerza"
                                        {...register('name')}
                                        className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all text-gray-900 dark:text-white ${errors.name
                                                ? 'border-red-300 dark:border-red-700'
                                                : 'border-gray-300 dark:border-gray-700'
                                            }`}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        placeholder="Describe los objetivos de esta rutina..."
                                        {...register('description')}
                                        className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all h-24 resize-none text-gray-900 dark:text-white ${errors.description
                                                ? 'border-red-300 dark:border-red-700'
                                                : 'border-gray-300 dark:border-gray-700'
                                            }`}
                                        rows="4"
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                            {errors.description.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Dialog.Close asChild>
                                        <button
                                            type="button"
                                            className="flex-1 px-4 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all"
                                            onClick={() => {
                                                reset();
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            Cancelar
                                        </button>
                                    </Dialog.Close>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3.5 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Creando...
                                            </>
                                        ) : (
                                            'Crear Rutina'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Confirm Delete Dialog */}
                <ConfirmDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
                    title="¿Eliminar rutina?"
                    description={`¿Estás seguro de eliminar la rutina "${deleteConfirm.routineName}"? Esta acción no se puede deshacer.`}
                    confirmLabel="Eliminar"
                    cancelLabel="Cancelar"
                    variant="danger"
                    onConfirm={handleDeleteConfirm}
                    loading={deleting}
                />
            </PageContainer>
        </AppLayout>
    );
};

export default RoutinesPage;
