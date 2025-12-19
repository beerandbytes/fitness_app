import React from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';

/**
 * Skeleton específico para CalendarPage
 */
export const CalendarPageSkeleton = () => {
  return (
    <AppLayout>
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
            </div>
          </div>

          {/* Calendario skeleton */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded text-center" />
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg p-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2" />
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full" />
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eventos del día skeleton */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
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

export default CalendarPageSkeleton;








