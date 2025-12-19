import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente de loading state mejorado con variantes
 */
const LoadingState = ({ variant = 'default', message = 'Cargando...', fullScreen = false }) => {
    const variants = {
        default: {
            spinner: 'border-blue-600',
            text: 'text-blue-600',
        },
        success: {
            spinner: 'border-green-600',
            text: 'text-green-600',
        },
        error: {
            spinner: 'border-red-600',
            text: 'text-red-600',
        },
    };

    const currentVariant = variants[variant] || variants.default;

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`w-12 h-12 border-4 ${currentVariant.spinner} border-t-transparent rounded-full`}
            />
            {message && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`${currentVariant.text} font-medium`}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            {content}
        </div>
    );
};

/**
 * Skeleton loader mejorado
 */
export const SkeletonCard = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 ${className}`}
    >
        <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
        </div>
    </motion.div>
);

/**
 * Pull to refresh indicator
 */
export const PullToRefresh = ({ pulling, refreshing }) => {
    if (!pulling && !refreshing) return null;

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: refreshing ? 0 : -30, opacity: 1 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
            <div className="bg-white dark:bg-gray-900 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-800 flex items-center gap-2">
                {refreshing ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Actualizando...
                        </span>
                    </>
                ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Suelta para actualizar
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default LoadingState;
