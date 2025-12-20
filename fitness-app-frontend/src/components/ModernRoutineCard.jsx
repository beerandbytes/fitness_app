import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { triggerHapticFeedback } from '../utils/microinteractions';

const ModernRoutineCard = ({ routine, onDelete, onUnlink }) => {
    const exerciseCount = routine.exercises?.length || 0;
    const isActive = routine.is_active;
    const isTemplate = routine.isTemplate;

    const handleAction = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isTemplate && onUnlink) {
            onUnlink(routine);
        } else if (!isTemplate && onDelete) {
            onDelete(routine.routine_id, routine.name);
        }
    };

    const CardContent = () => (
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 hover:border-gray-300/50 dark:hover:border-gray-700/50 hover:shadow-lg transition-all duration-500 h-full flex flex-col shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-light tracking-tight text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {routine.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        {!isTemplate && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${isActive
                                    ? 'bg-green-100/60 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-800/50'
                                    : 'bg-gray-100/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-800/50'
                                }`}>
                                {isActive ? 'Activa' : 'Inactiva'}
                            </span>
                        )}
                        {isTemplate && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50">
                                Plantilla
                            </span>
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Descripción */}
            {routine.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 font-light leading-relaxed">
                    {routine.description}
                </p>
            )}

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
                <button
                    onClick={handleAction}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 active:scale-95 ${isTemplate
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                            : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                    aria-label={isTemplate ? `Usar plantilla ${routine.name}` : `Eliminar rutina ${routine.name}`}
                >
                    {isTemplate ? 'Usar Plantilla' : 'Eliminar'}
                </button>

                {!isTemplate && (
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Ver detalles
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {isTemplate ? (
                <div
                    className="block group cursor-pointer"
                    onClick={() => {
                        triggerHapticFeedback('light');
                        // Optional: Open template details modal if implemented
                    }}
                >
                    <CardContent />
                </div>
            ) : (
                <Link
                    to={`/routines/${routine.routine_id}`}
                    className="block group"
                    onClick={() => triggerHapticFeedback('light')}
                >
                    <CardContent />
                </Link>
            )}
        </motion.div>
    );
};

export default ModernRoutineCard;
