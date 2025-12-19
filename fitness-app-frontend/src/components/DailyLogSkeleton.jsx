import React from 'react';

/**
 * Skeleton específico para DailyLogPage
 */
export const DailyLogSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton para resumen de calorías */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-pink-500/40 to-blue-600/40 dark:from-pink-600/40 dark:to-blue-500/40 rounded-3xl p-8 border border-white/20 dark:border-white/10">
        <div className="h-6 bg-white/30 dark:bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-16 bg-white/30 dark:bg-white/10 rounded w-1/2 mb-2" />
        <div className="h-4 bg-white/30 dark:bg-white/10 rounded w-1/4" />
      </div>

      {/* Skeleton para búsqueda de ejercicios */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>

      {/* Skeleton para lista de ejercicios */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

