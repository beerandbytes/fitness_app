import React from 'react';

/**
 * Skeleton específico para AchievementsPage
 */
export const AchievementsPageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96" />
      </div>

      {/* Stats Card skeleton */}
      <div className="bg-gradient-to-r from-blue-500/50 to-purple-600/50 dark:from-blue-600/50 dark:to-purple-700/50 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-white/30 dark:bg-white/10 rounded w-32 mb-2" />
            <div className="h-10 bg-white/30 dark:bg-white/10 rounded w-24" />
          </div>
          <div className="w-24 h-24 bg-white/30 dark:bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-24" />
        ))}
      </div>

      {/* Achievements Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPageSkeleton;

