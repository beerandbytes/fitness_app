import React from 'react';

/**
 * Skeleton específico para ExercisesPage
 */
export const ExercisesPageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-3" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-full w-40" />
      </div>

      {/* Search and Filters skeleton */}
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-24" />
          ))}
        </div>
      </div>

      {/* Exercises Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800"
          >
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
};

export default ExercisesPageSkeleton;

