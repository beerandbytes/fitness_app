import { useState, useCallback } from 'react';
import useToastStore from '../stores/useToastStore';
import logger from '../utils/logger';

/**
 * Hook para manejar actualizaciones optimistas
 * Actualiza la UI inmediatamente antes de que el servidor responda
 * y revierte si la acción falla
 */
export const useOptimisticUpdate = ({
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  rollbackOnError = true,
}) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToastStore();

  const execute = useCallback(async (optimisticUpdate, apiCall) => {
    setIsPending(true);
    setError(null);

    // Guardar estado anterior para rollback
    let previousState = null;
    if (rollbackOnError && optimisticUpdate) {
      previousState = optimisticUpdate.getPreviousState?.();
    }

    try {
      // Aplicar actualización optimista
      if (optimisticUpdate) {
        optimisticUpdate.apply();
      }

      // Ejecutar llamada API
      const result = await apiCall();

      // Si hay callback de éxito, ejecutarlo
      if (onSuccess) {
        onSuccess(result);
      }

      // Mostrar mensaje de éxito
      if (successMessage) {
        toast.success(successMessage);
      }

      setIsPending(false);
      return result;
    } catch (err) {
      logger.error('Error en actualización optimista:', err);

      // Revertir cambios si es necesario
      if (rollbackOnError && previousState && optimisticUpdate) {
        optimisticUpdate.revert(previousState);
      }

      // Si hay callback de error, ejecutarlo
      if (onError) {
        onError(err);
      }

      // Mostrar mensaje de error
      const message = errorMessage || err.response?.data?.error || 'Error al realizar la acción';
      toast.error(message);

      setError(err);
      setIsPending(false);
      throw err;
    }
  }, [onSuccess, onError, successMessage, errorMessage, rollbackOnError, toast]);

  return {
    execute,
    isPending,
    error,
  };
};

/**
 * Helper para crear actualizaciones optimistas de listas
 */
export const createListOptimisticUpdate = (setList, item, action = 'add') => {
  return {
    apply: () => {
      if (action === 'add') {
        setList(prev => [...prev, item]);
      } else if (action === 'remove') {
        setList(prev => prev.filter(i => {
          const idKey = i.id || i.exercise_id || i.routine_id || i.log_id;
          const itemId = item.id || item.exercise_id || item.routine_id || item.log_id;
          return idKey !== itemId;
        }));
      } else if (action === 'update') {
        setList(prev => prev.map(i => {
          const idKey = i.id || i.exercise_id || i.routine_id || i.log_id;
          const itemId = item.id || item.exercise_id || item.routine_id || item.log_id;
          return idKey === itemId ? { ...i, ...item } : i;
        }));
      }
    },
    getPreviousState: () => {
      // Retornar función para obtener estado anterior
      return (currentList) => currentList;
    },
    revert: (previousState) => {
      if (typeof previousState === 'function') {
        setList(previousState);
      } else {
        setList(previousState);
      }
    },
  };
};

/**
 * Helper para actualizaciones optimistas de valores únicos
 */
export const createValueOptimisticUpdate = (setValue, newValue) => {
  let previousValue = null;
  return {
    apply: () => {
      previousValue = typeof setValue === 'function' ? null : setValue;
      if (typeof setValue === 'function') {
        setValue(newValue);
      }
    },
    getPreviousState: () => previousValue,
    revert: (prev) => {
      if (typeof setValue === 'function') {
        setValue(prev);
      }
    },
  };
};

