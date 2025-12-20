import { useRef, useCallback } from 'react';

/**
 * Hook para rate limiting de funciones
 * @param {Function} fn - Función a limitar
 * @param {number} limit - Número máximo de llamadas
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @returns {Function} - Función con rate limiting
 */
export const useRateLimit = (fn, limit = 10, windowMs = 1000) => {
  const calls = useRef([]);
  // Usar ref para almacenar la referencia más reciente de fn y evitar stale closures
  const fnRef = useRef(fn);

  // Actualizar la referencia del callback siempre
  fnRef.current = fn;

  // Memoizar la función retornada para evitar recreaciones en cada render
  return useCallback((...args) => {
    const now = Date.now();
    
    // Limpiar llamadas fuera de la ventana
    calls.current = calls.current.filter(time => now - time < windowMs);
    
    // Si excede el límite, no ejecutar
    if (calls.current.length >= limit) {
      console.warn(`Rate limit excedido: máximo ${limit} llamadas por ${windowMs}ms`);
      return;
    }
    
    // Registrar la llamada
    calls.current.push(now);
    
    // Ejecutar la función usando la referencia más reciente
    return fnRef.current(...args);
  }, [limit, windowMs]);
};

