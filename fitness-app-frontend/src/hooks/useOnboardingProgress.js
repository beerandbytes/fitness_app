import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_STORAGE_KEY = 'onboarding_progress';

/**
 * Hook para gestionar el progreso del onboarding
 * Guarda el progreso en localStorage para permitir continuar después
 */
export const useOnboardingProgress = () => {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar progreso guardado al montar
  useEffect(() => {
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verificar que el progreso no sea muy antiguo (más de 7 días)
        const savedAt = new Date(parsed.savedAt);
        const daysDiff = (new Date() - savedAt) / (1000 * 60 * 60 * 24);

        if (daysDiff < 7) {
          setProgress(parsed);
        } else {
          // Limpiar progreso antiguo
          localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Error al cargar progreso de onboarding:', e);
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Guardar progreso
  const saveProgress = useCallback((step, formData) => {
    const progressData = {
      step,
      formData,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progressData));
      setProgress(progressData);
    } catch (e) {
      console.error('Error al guardar progreso de onboarding:', e);
    }
  }, []);

  // Limpiar progreso (cuando se completa)
  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      setProgress(null);
    } catch (e) {
      console.error('Error al limpiar progreso de onboarding:', e);
    }
  }, []);

  // Verificar si hay progreso guardado
  const hasSavedProgress = useCallback(() => {
    return progress !== null;
  }, [progress]);

  // Restaurar progreso guardado
  const restoreProgress = useCallback(() => {
    if (progress) {
      return {
        step: progress.step,
        formData: progress.formData,
      };
    }
    return null;
  }, [progress]);

  return {
    progress,
    isLoading,
    saveProgress,
    clearProgress,
    hasSavedProgress,
    restoreProgress,
  };
};

export default useOnboardingProgress;

