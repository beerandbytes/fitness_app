import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    const [targetRect, setTargetRect] = useState(null);
    const elementRef = useRef(null);
    const timeoutRef = useRef(null);
    const rafRef = useRef(null);
    const isUpdatingRef = useRef(false);
    const scrollTimeoutRef = useRef(null);
    const resizeTimeoutRef = useRef(null);
    
    // Memoizar steps para evitar recreación constante del useEffect
    const stepsString = useMemo(() => JSON.stringify(steps), [steps]);
    const memoizedSteps = useMemo(() => steps, [stepsString]);

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
        if (!isActive || !memoizedSteps || memoizedSteps.length === 0) {
            elementRef.current = null;
            setTargetRect(null);
            return;
        }

        const step = memoizedSteps[currentStep];
        if (!step || !step.target) {
            elementRef.current = null;
            setTargetRect(null);
            return;
        }

        // Función para actualizar posición usando requestAnimationFrame para mejor rendimiento
        const updatePosition = () => {
            if (isUpdatingRef.current) return;
            
            if (!step || !step.target) return;

            const currentElement = elementRef.current || (typeof step.target === 'string' 
                ? document.querySelector(step.target)
                : step.target);
                
            if (currentElement) {
                elementRef.current = currentElement;
                isUpdatingRef.current = true;
                
                // Cancelar cualquier RAF pendiente
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
                
                rafRef.current = requestAnimationFrame(() => {
                    const rect = currentElement.getBoundingClientRect();
                    const newRect = {
                        left: rect.left + window.scrollX,
                        top: rect.top + window.scrollY,
                        width: rect.width,
                        height: rect.height,
                    };
                    
                    // Solo actualizar si el rect cambió significativamente (más de 1px)
                    setTargetRect(prev => {
                        if (!prev) return newRect;
                        const diff = Math.abs(prev.left - newRect.left) + 
                                    Math.abs(prev.top - newRect.top) + 
                                    Math.abs(prev.width - newRect.width) + 
                                    Math.abs(prev.height - newRect.height);
                        // Solo actualizar si hay un cambio significativo
                        return diff > 1 ? newRect : prev;
                    });
                    isUpdatingRef.current = false;
                });
            }
        };

        let retryCount = 0;
        const maxRetries = 10;

        const findElement = () => {
            const element = typeof step.target === 'string' 
                ? document.querySelector(step.target)
                : step.target;
            
            if (element) {
                elementRef.current = element;
                updatePosition();
            } else {
                retryCount++;
                if (retryCount < maxRetries) {
                    timeoutRef.current = setTimeout(findElement, 100);
                } else {
                    console.warn(`Elemento no encontrado después de ${maxRetries} intentos: ${step.target}`);
                    setIsActive(false);
                }
            }
        };

        findElement();

        // Throttle de eventos de scroll y resize para mejor rendimiento
        const handleScroll = () => {
            if (scrollTimeoutRef.current) return;
            scrollTimeoutRef.current = setTimeout(() => {
                updatePosition();
                scrollTimeoutRef.current = null;
            }, 16); // ~60fps
        };

        const handleResize = () => {
            if (resizeTimeoutRef.current) return;
            resizeTimeoutRef.current = setTimeout(() => {
                updatePosition();
                resizeTimeoutRef.current = null;
            }, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = null;
            }
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
                resizeTimeoutRef.current = null;
            }
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            isUpdatingRef.current = false;
        };
    }, [isActive, currentStep, memoizedSteps]); // Usar memoizedSteps en lugar de steps

    if (!isActive || !memoizedSteps || memoizedSteps.length === 0) {
        return null;
    }

    const step = memoizedSteps[currentStep];
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
            {/* Overlay oscuro con agujero para el elemento */}
            {targetRect ? (
                <>
                    <div
                        className="fixed inset-0 z-[9998] backdrop-blur-sm transition-opacity duration-300"
                        style={{
                            background: `radial-gradient(ellipse ${Math.max(targetRect.width + 32, 100)}px ${Math.max(targetRect.height + 32, 100)}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 0%, transparent 35%, rgba(0, 0, 0, 0.6) 70%)`,
                        }}
                        onClick={handleSkip}
                        aria-hidden="true"
                    />
                    {/* Borde del elemento */}
                    <div
                        className="fixed z-[9999] border-4 border-blue-500 rounded-lg pointer-events-none shadow-2xl transition-all duration-200"
                        style={{
                            left: `${targetRect.left - 4}px`,
                            top: `${targetRect.top - 4}px`,
                            width: `${targetRect.width + 8}px`,
                            height: `${targetRect.height + 8}px`,
                        }}
                    />
                </>
            ) : (
                <div
                    className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                    onClick={handleSkip}
                    aria-hidden="true"
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
                                {currentStep + 1} de {memoizedSteps.length}
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

