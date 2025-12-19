import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para debounce de valores
 * Útil para búsquedas, validaciones, etc.
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos (default: 500)
 * @returns {any} - Valor debounced
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para debounce de funciones
 * Usa useRef para evitar recrear el callback en cada render
 */
export const useDebouncedCallback = (callback, delay = 500) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  // Actualizar la referencia del callback siempre
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Función debounced que usa la referencia más reciente
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

