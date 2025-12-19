import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Zap } from 'lucide-react';

/**
 * Widget de motivación con mensajes inspiradores
 */
const MotivationWidget = ({ streak, progressData }) => {
    const motivationalMessages = [
        { icon: Zap, text: '¡Sigue así! Estás haciendo un gran trabajo', color: 'yellow' },
        { icon: TrendingUp, text: 'El progreso constante es la clave del éxito', color: 'blue' },
        { icon: Award, text: 'Cada día te acercas más a tus objetivos', color: 'purple' },
    ];

    const getRandomMessage = () => {
        return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    };

    const [message] = React.useState(getRandomMessage());

    if (!streak || streak === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl border-2 border-blue-200 dark:border-blue-800 p-6 shadow-lg"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-${message.color}-100 dark:bg-${message.color}-900/30 rounded-2xl flex items-center justify-center`}>
                    <message.icon className={`w-6 h-6 text-${message.color}-600 dark:text-${message.color}-400`} />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {message.text}
                    </h4>
                    {streak >= 7 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Has entrenado {streak} días consecutivos. ¡Eso es consistencia!
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MotivationWidget;

