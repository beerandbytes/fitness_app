import React from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';

/**
 * Skeleton específico para MessagesPage
 */
export const MessagesPageSkeleton = () => {
  return (
    <AppLayout>
      <PageContainer>
        <div className="flex h-[calc(100vh-200px)] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-black/60 animate-pulse">
          {/* Lista de conversaciones skeleton */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 p-4 space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Área de mensajes skeleton */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-4 rounded-2xl ${i % 2 === 0 ? 'bg-blue-500/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default MessagesPageSkeleton;








