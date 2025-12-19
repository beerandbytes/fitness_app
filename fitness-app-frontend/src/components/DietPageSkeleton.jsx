import React from 'react';

/**
 * Skeleton específico para DietPage
 */
export const DietPageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40" />
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>

      {/* Calorie Radial Chart skeleton */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-8">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
        <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
      </div>

      {/* Macro Bar Chart skeleton */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-8">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Food Search skeleton */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Meal Items skeleton */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50">
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

export default DietPageSkeleton;

