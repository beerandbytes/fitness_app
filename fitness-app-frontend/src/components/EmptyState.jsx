import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Componente EmptyState reutilizable para mostrar estados vacíos
 * con acciones claras y guías para el usuario
 */
const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionPath,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionPath,
  secondaryActionOnClick,
  illustration,
  IllustrationComponent,
  className = ''
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {IllustrationComponent ? (
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 w-48 h-48 mx-auto text-gray-400 dark:text-gray-600 flex items-center justify-center"
        >
          <IllustrationComponent />
        </motion.div>
      ) : illustration ? (
        <div className="mb-6 w-48 h-48 mx-auto">
          <img 
            src={illustration} 
            alt={title}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      ) : icon ? (
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 flex items-center justify-center"
        >
          {icon}
        </motion.div>
      ) : (
        <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {(actionLabel || secondaryActionLabel) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {actionPath && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={actionPath}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
              >
                {actionLabel}
              </Link>
            </motion.div>
          )}
          
          {actionOnClick && (
            <motion.button
              onClick={actionOnClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={actionLabel}
            >
              {actionLabel}
            </motion.button>
          )}
          
          {secondaryActionLabel && secondaryActionPath && (
            <Link
              to={secondaryActionPath}
              className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {secondaryActionLabel}
            </Link>
          )}
          
          {secondaryActionLabel && secondaryActionOnClick && (
            <button
              onClick={secondaryActionOnClick}
              className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label={secondaryActionLabel}
            >
              {secondaryActionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;

