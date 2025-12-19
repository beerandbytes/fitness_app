import React from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';

/**
 * Skeleton específico para CoachClientDetail
 */
export const CoachClientDetailSkeleton = () => {
  return (
    <AppLayout>
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg w-24" />
            ))}
          </div>

          {/* Contenido skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gráfico skeleton */}
              <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>

              {/* Actividad reciente skeleton */}
              <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-800">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Estadísticas skeleton */}
              <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default CoachClientDetailSkeleton;








