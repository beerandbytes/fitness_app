import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import apiCache from '../utils/cache';
import logger from '../utils/logger';

/**
 * Hook para hacer llamadas API con caché automático
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones de configuración
 * @param {object} options.params - Parámetros de query
 * @param {number} options.ttl - Tiempo de vida del caché en ms (default: 5 minutos)
 * @param {boolean} options.enableCache - Habilitar caché (default: true)
 * @param {string} options.method - Método HTTP (default: 'GET')
 * @param {object} options.data - Datos para POST/PUT
 */
export const useCachedApi = (url, options = {}) => {
  const {
    params = {},
    ttl = 5 * 60 * 1000, // 5 minutos por defecto
    enableCache = true,
    method = 'GET',
    body = null, // Datos para POST/PUT
    immediate = true, // Ejecutar inmediatamente
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const cacheKey = apiCache.generateKey(url, params);
  
  // Usar refs para almacenar valores anteriores y comparar por contenido
  const prevParamsRef = useRef(params);
  const prevBodyRef = useRef(body);
  const paramsStringRef = useRef(JSON.stringify(params));
  const bodyStringRef = useRef(body ? JSON.stringify(body) : '');
  
  // Comparación profunda antes de recalcular strings para evitar recreaciones innecesarias
  const paramsString = useMemo(() => {
    const currentString = JSON.stringify(params);
    // Solo recalcular si el contenido realmente cambió (comparación por string)
    if (currentString !== paramsStringRef.current) {
      prevParamsRef.current = params;
      paramsStringRef.current = currentString;
    }
    return paramsStringRef.current;
  }, [params]);
  
  const bodyString = useMemo(() => {
    const currentString = body ? JSON.stringify(body) : '';
    // Solo recalcular si el contenido realmente cambió (comparación por string)
    if (currentString !== bodyStringRef.current) {
      prevBodyRef.current = body;
      bodyStringRef.current = currentString;
    }
    return bodyStringRef.current;
  }, [body]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Intentar obtener del caché si está habilitado y no es refresh forzado
    if (enableCache && !forceRefresh) {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await api.get(url, { params });
          break;
        case 'POST':
          response = await api.post(url, body, { params });
          break;
        case 'PUT':
          response = await api.put(url, body, { params });
          break;
        case 'DELETE':
          response = await api.delete(url, { params });
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }

      const responseData = response.data;

      // Guardar en caché solo para GET requests exitosos
      if (enableCache && method.toUpperCase() === 'GET' && responseData) {
        apiCache.set(cacheKey, responseData, ttl);
      }

      setData(responseData);
    } catch (err) {
      setError(err);
      logger.error('Error en useCachedApi:', err);
    } finally {
      setLoading(false);
    }
  }, [url, paramsString, method, bodyString, enableCache, cacheKey, ttl]);
  // params y body están memoizados como paramsString y bodyString, no necesitan estar en dependencias

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // fetchData está memoizado con useCallback y sus dependencias son estables
    // Incluir fetchData en dependencias para evitar problemas en producción
  }, [immediate, fetchData]);

  // Función para refrescar datos (ignorar caché)
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Función para invalidar caché
  const invalidate = useCallback(() => {
    apiCache.delete(cacheKey);
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
  };
};

export default useCachedApi;

