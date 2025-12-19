import React from 'react';
import { CardSkeleton } from './SkeletonLoader';

/**
 * Skeleton específico para RoutinesPage
 */
export const RoutinesPageSkeleton = () => {
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

      {/* Grid de rutinas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CardSkeleton count={6} />
      </div>
    </div>
  );
};

