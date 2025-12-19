import React from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';

/**
 * Skeleton específico para Dashboard
 */
export const DashboardPageSkeleton = () => {
  return (
    <AppLayout>
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>

          {/* Widgets skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>

          {/* Gráficos skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>

          {/* Tareas skeleton */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
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

export default DashboardPageSkeleton;








