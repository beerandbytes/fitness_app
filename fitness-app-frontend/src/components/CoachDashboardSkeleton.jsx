import React from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';

/**
 * Skeleton específico para CoachDashboard
 */
export const CoachDashboardSkeleton = () => {
  return (
    <AppLayout>
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
          </div>

          {/* Estadísticas skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>

          {/* Filtros skeleton */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
            ))}
          </div>

          {/* Lista de clientes skeleton */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default CoachDashboardSkeleton;








