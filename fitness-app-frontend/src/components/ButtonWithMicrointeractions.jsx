import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente de botón con microinteracciones mejoradas
 * Incluye animaciones de hover, active, y éxito
 */
const ButtonWithMicrointeractions = ({
    children,
    onClick,
    variant = 'primary', // 'primary', 'secondary', 'danger', 'success'
    size = 'md', // 'sm', 'md', 'lg'
    disabled = false,
    loading = false,
    success = false,
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600',
        secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
        danger: 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600',
        success: 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${variants[variant]} 
                ${sizes[size]} 
                rounded-xl font-medium 
                transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${className}
            `}
            whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            animate={success ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {loading ? (
                <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Cargando...</span>
                </motion.div>
            ) : success ? (
                <motion.div
                    className="flex items-center gap-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>¡Completado!</span>
                </motion.div>
            ) : (
                children
            )}
        </motion.button>
    );
};

export default ButtonWithMicrointeractions;

