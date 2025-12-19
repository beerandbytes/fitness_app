import React from 'react';

/**
 * Skeleton específico para WeightTrackingPage
 */
export const WeightTrackingPageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Weight Chart skeleton */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-sm">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Forms Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Form skeleton */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-sm">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        </div>

        {/* Goal Manager skeleton */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-sm">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightTrackingPageSkeleton;

