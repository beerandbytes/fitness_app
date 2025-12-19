import React from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';

/**
 * Skeleton específico para ActiveWorkoutPage
 */
export const ActiveWorkoutPageSkeleton = () => {
  return (
    <AppLayout>
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
          </div>

          {/* Cronómetro skeleton */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-pink-500/40 to-blue-600/40 dark:from-pink-600/40 dark:to-blue-500/40 rounded-3xl p-8 text-center border border-white/20 dark:border-white/10">
            <div className="h-20 bg-white/30 dark:bg-white/10 rounded w-1/2 mx-auto mb-4" />
            <div className="h-6 bg-white/30 dark:bg-white/10 rounded w-1/3 mx-auto" />
          </div>

          {/* Progreso skeleton */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>

          {/* Lista de ejercicios skeleton */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default ActiveWorkoutPageSkeleton;








