import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

/**
 * Componente de tour interactivo mejorado
 * Compatible con React 19 y con mejor UX
 */
const EnhancedInteractiveTour = ({ 
    steps = [], 
    onComplete, 
    onSkip,
    tourId,
    autoStart = false,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(autoStart && steps.length > 0);
    const [targetElement, setTargetElement] = useState(null);
    const [targetRect, setTargetRect] = useState(null);

    // Verificar si el tour ya fue completado
    useEffect(() => {
        if (tourId) {
            const completedTours = JSON.parse(localStorage.getItem('completed_tours') || '[]');
            if (completedTours.includes(tourId)) {
                setIsActive(false);
            }
        }
    }, [tourId]);

    // Encontrar y seguir el elemento objetivo
    useEffect(() => {
        if (!isActive || !steps || steps.length === 0) {
            setTargetElement(null);
            setTargetRect(null);
            return;
        }

        const step = steps[currentStep];
        if (!step || !step.target) {
            setTargetElement(null);
            setTargetRect(null);
            return;
        }

        let timeoutId = null;
        let elementRef = null;

        const findElement = () => {
            const element = typeof step.target === 'string' 
                ? document.querySelector(step.target)
                : step.target;
            
            if (element) {
                elementRef = element;
                setTargetElement(element);
                const rect = element.getBoundingClientRect();
                setTargetRect({
                    left: rect.left + window.scrollX,
                    top: rect.top + window.scrollY,
                    width: rect.width,
                    height: rect.height,
                });
            } else {
                // Si no se encuentra el elemento, intentar de nuevo después de un delay (máximo 10 intentos)
                const retryCount = findElement.retryCount || 0;
                if (retryCount < 10) {
                    findElement.retryCount = retryCount + 1;
                    timeoutId = setTimeout(findElement, 100);
                } else {
                    // Si después de 10 intentos no se encuentra, desactivar el tour
                    console.warn(`Elemento no encontrado: ${step.target}`);
                    setIsActive(false);
                }
            }
        };

        findElement.retryCount = 0;
        findElement();

        // Actualizar posición cuando se hace scroll o resize
        const updatePosition = () => {
            const currentElement = elementRef || (typeof step.target === 'string' 
                ? document.querySelector(step.target)
                : step.target);
            if (currentElement) {
                const rect = currentElement.getBoundingClientRect();
                setTargetRect({
                    left: rect.left + window.scrollX,
                    top: rect.top + window.scrollY,
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isActive, currentStep, steps]);

    if (!isActive || !steps || steps.length === 0) {
        return null;
    }

    const step = steps[currentStep];
    if (!step) return null;

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
        if (tourId) {
            const completedTours = JSON.parse(localStorage.getItem('completed_tours') || '[]');
            if (!completedTours.includes(tourId)) {
                completedTours.push(tourId);
                localStorage.setItem('completed_tours', JSON.stringify(completedTours));
            }
        }
        if (onComplete) {
            onComplete();
        }
    };

    // Calcular posición del tooltip
    const tooltipPosition = targetRect
        ? {
            left: targetRect.left + targetRect.width / 2,
            top: targetRect.top + targetRect.height + 16,
            transform: 'translateX(-50%)',
        }
        : {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        };

    return (
        <>
            {/* Overlay oscuro */}
            <div
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleSkip}
                aria-hidden="true"
            />

            {/* Highlight del elemento objetivo */}
            {targetRect && (
                <div
                    className="fixed z-[9999] border-4 border-blue-500 rounded-lg pointer-events-none shadow-2xl transition-all duration-300"
                    style={{
                        left: `${targetRect.left - 4}px`,
                        top: `${targetRect.top - 4}px`,
                        width: `${targetRect.width + 8}px`,
                        height: `${targetRect.height + 8}px`,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className="fixed z-[10000] max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300"
                style={tooltipPosition}
                role="dialog"
                aria-labelledby="tour-title"
                aria-describedby="tour-description"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {currentStep + 1}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {currentStep + 1} de {steps.length}
                            </span>
                        </div>
                        {step.title && (
                            <h3 id="tour-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                                {step.title}
                            </h3>
                        )}
                    </div>
                    <button
                        onClick={handleSkip}
                        className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Cerrar tour"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Contenido */}
                {step.content && (
                    <p id="tour-description" className="text-gray-600 dark:text-gray-400 mb-6">
                        {step.content}
                    </p>
                )}

                {/* Footer con botones */}
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Saltar tour
                    </button>

                    <div className="flex gap-2">
                        {!isFirst && (
                            <button
                                onClick={handlePrevious}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                                aria-label="Paso anterior"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-1"
                            aria-label={isLast ? "Finalizar tour" : "Siguiente paso"}
                        >
                            {isLast ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Finalizar
                                </>
                            ) : (
                                <>
                                    Siguiente
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

/**
 * Hook para gestionar tours
 */
export const useTour = () => {
    const [activeTour, setActiveTour] = useState(null);
    const [completedTours, setCompletedTours] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('completed_tours') || '[]');
        } catch {
            return [];
        }
    });

    const startTour = (tourId, steps) => {
        if (!completedTours.includes(tourId)) {
            setActiveTour({ tourId, steps });
        }
    };

    const completeTour = (tourId) => {
        setActiveTour(null);
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
        activeTour,
        startTour,
        completeTour,
        resetTour,
        hasCompletedTour: (tourId) => completedTours.includes(tourId),
    };
};

export default EnhancedInteractiveTour;

