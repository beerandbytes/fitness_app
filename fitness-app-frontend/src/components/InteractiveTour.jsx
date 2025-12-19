import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

/**
 * Componente de tour interactivo simple
 * Para una versión más avanzada, instalar react-joyride:
 * npm install react-joyride
 */
const InteractiveTour = ({ steps, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(() => steps && steps.length > 0);

  if (!isActive || !steps || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    if (onSkip) {
      onSkip();
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Encontrar el elemento objetivo
  const targetElement = step.target ? document.querySelector(step.target) : null;
  const targetRect = targetElement ? targetElement.getBoundingClientRect() : null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Highlight del elemento objetivo */}
      {targetRect && (
        <div
          className="fixed z-[9999] border-4 border-blue-500 rounded-lg pointer-events-none"
          style={{
            left: `${targetRect.left}px`,
            top: `${targetRect.top}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 max-w-sm"
        style={{
          left: targetRect
            ? `${targetRect.left + targetRect.width / 2}px`
            : '50%',
          top: targetRect
            ? `${targetRect.bottom + 20}px`
            : '50%',
          transform: targetRect ? 'translateX(-50%)' : 'translate(-50%, -50%)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Cerrar tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step.title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
        )}

        {step.content && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {step.content}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Saltar tour
          </button>

          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InteractiveTour;

/**
 * Hook para gestionar tours
 */
export const useTour = () => {
  const [isActive, setIsActive] = useState(false);
  const [completedTours, setCompletedTours] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('completed_tours') || '[]');
    } catch {
      return [];
    }
  });

  const startTour = (tourId) => {
    if (!completedTours.includes(tourId)) {
      setIsActive(true);
    }
  };

  const completeTour = (tourId) => {
    setIsActive(false);
    const updated = [...completedTours, tourId];
    setCompletedTours(updated);
    localStorage.setItem('completed_tours', JSON.stringify(updated));
  };

  const resetTour = (tourId) => {
    const updated = completedTours.filter(id => id !== tourId);
    setCompletedTours(updated);
    localStorage.setItem('completed_tours', JSON.stringify(updated));
  };

  return {
    isActive,
    startTour,
    completeTour,
    resetTour,
    hasCompletedTour: (tourId) => completedTours.includes(tourId),
  };
};

