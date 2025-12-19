import React from 'react';
import { motion } from 'framer-motion';
import useHapticFeedback from '../hooks/useHapticFeedback';

/**
 * Componente de botón mejorado con microinteracciones
 */
const EnhancedButton = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    haptic = true,
    className = '',
    ...props
}) => {
    const { lightImpact } = useHapticFeedback();

    const variants = {
        primary: 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600',
        secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
        success: 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600',
        danger: 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const handleClick = (e) => {
        if (disabled || loading) return;
        
        if (haptic) {
            lightImpact();
        }
        
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <motion.button
            whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                rounded-xl font-semibold transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:scale-100
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Cargando...
                </span>
            ) : (
                children
            )}
        </motion.button>
    );
};

export default EnhancedButton;

