# Ejemplos de Implementación - Mejoras Críticas

Este documento contiene ejemplos de código para implementar las mejoras críticas identificadas.

---

## 🔴 Backend: Middleware de Manejo de Errores Centralizado

### 1. Crear `middleware/errorHandler.js`

```javascript
const logger = require('../utils/logger');

/**
 * Middleware centralizado para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error('Error en la aplicación:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    body: req.body,
  });

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.details || err.message,
    });
  }

  // Errores de autenticación
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      error: 'No autorizado',
      message: err.message || 'Token inválido o expirado',
    });
  }

  // Errores de base de datos
  if (err.code && err.code.startsWith('23')) {
    // Errores de integridad (23505: unique violation, etc.)
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Conflicto',
        message: 'El recurso ya existe',
        details: process.env.NODE_ENV === 'development' ? err.detail : undefined,
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Referencia inválida',
        message: 'La referencia especificada no existe',
      });
    }
  }

  // Error por defecto
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error. Por favor, intenta más tarde.'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
};

module.exports = errorHandler;
```

### 2. Crear `middleware/asyncHandler.js`

```javascript
/**
 * Wrapper para manejar errores async en rutas
 * Evita tener que usar try-catch en cada ruta
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
```

### 3. Actualizar `index.js` para usar el error handler

```javascript
// Al final del archivo, antes de app.listen
// Importar el error handler
const errorHandler = require('./middleware/errorHandler');

// ... todas las rutas ...

// Error handler debe ir AL FINAL, después de todas las rutas
app.use(errorHandler);

// Manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
});
```

### 4. Ejemplo de uso en una ruta

```javascript
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

// Antes (con try-catch manual)
router.get('/example', authenticateToken, async (req, res) => {
  try {
    const data = await db.select().from(users);
    res.json(data);
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Después (con asyncHandler)
router.get('/example', 
  authenticateToken, 
  asyncHandler(async (req, res) => {
    const data = await db.select().from(users);
    res.json(data);
    // Los errores se manejan automáticamente
  })
);
```

---

## 🔴 Backend: Mejorar Pool de Conexiones

### Actualizar `db/db_config.js`

```javascript
require('dotenv').config();

const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const schema = require('./schema');
const logger = require('../utils/logger');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no está definido en el archivo .env');
}

// Pool mejorado con configuración avanzada
const pool = new Pool({
  connectionString: connectionString,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Máximo de conexiones
  min: parseInt(process.env.DB_POOL_MIN || '5', 10), // Mínimo de conexiones
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10), // 30s
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10), // 2s
  allowExitOnIdle: false, // No cerrar pool cuando no hay conexiones activas
});

// Event handlers para monitoreo
pool.on('connect', (client) => {
  logger.debug('Nueva conexión a la base de datos establecida');
});

pool.on('error', (err, client) => {
  logger.error('Error inesperado en el pool de conexiones:', {
    error: err.message,
    stack: err.stack,
  });
});

pool.on('acquire', (client) => {
  logger.debug('Conexión adquirida del pool');
});

pool.on('remove', (client) => {
  logger.debug('Conexión removida del pool');
});

// Health check del pool
pool.on('connect', async (client) => {
  try {
    await client.query('SELECT NOW()');
    logger.debug('Health check de conexión exitoso');
  } catch (err) {
    logger.error('Error en health check de conexión:', err);
  }
});

const db = drizzle(pool, { schema: schema });

// Función para verificar salud del pool
async function checkDatabaseHealth() {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    return {
      healthy: true,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version,
      poolStats: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      },
    };
  } catch (error) {
    logger.error('Error en health check de base de datos:', error);
    return {
      healthy: false,
      error: error.message,
    };
  }
}

module.exports = {
  db,
  pool,
  checkDatabaseHealth,
};
```

---

## 🔴 Backend: Health Check Endpoint

### Crear `routes/health.js`

```javascript
const express = require('express');
const router = express.Router();
const { checkDatabaseHealth } = require('../db/db_config');
const logger = require('../utils/logger');

/**
 * GET /api/health
 * Endpoint de health check para monitoreo
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar base de datos
    const dbHealth = await checkDatabaseHealth();
    
    // Verificar memoria
    const memoryUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };
    
    // Verificar uptime
    const uptime = process.uptime();
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: dbHealth.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: formatUptime(uptime),
      },
      database: dbHealth,
      memory: memoryMB,
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
    
    const statusCode = dbHealth.healthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Error en health check:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/ready
 * Endpoint de readiness (listo para recibir tráfico)
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    if (dbHealth.healthy) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: 'Database unavailable' });
    }
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});

/**
 * GET /api/health/live
 * Endpoint de liveness (aplicación está viva)
 */
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true, timestamp: new Date().toISOString() });
});

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = router;
```

### Agregar a `index.js`

```javascript
// Agregar después de las rutas públicas
const healthRoutes = require('./routes/health');
app.use('/api/health', healthRoutes);
```

---

## 🔴 Frontend: Hook de Manejo de Errores Centralizado

### Crear `src/hooks/useErrorHandler.js`

```javascript
import { useCallback } from 'react';
import { useToastStore } from '../stores/useToastStore';
import api from '../services/api';

/**
 * Hook para manejo centralizado de errores
 */
export const useErrorHandler = () => {
  const { showToast } = useToastStore();

  const handleError = useCallback((error, options = {}) => {
    const {
      showToast: showToastOption = true,
      fallbackMessage = 'Ha ocurrido un error. Por favor, intenta de nuevo.',
      logError = true,
    } = options;

    // Log del error
    if (logError && import.meta.env.DEV) {
      console.error('Error capturado:', error);
    }

    // Determinar mensaje de error
    let message = fallbackMessage;

    if (error?.response) {
      // Error de respuesta del servidor
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          message = data?.error || data?.message || 'Datos inválidos';
          break;
        case 401:
          message = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
          // Opcional: redirigir a login
          if (options.redirectOn401 !== false) {
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
          break;
        case 403:
          message = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          message = 'Recurso no encontrado';
          break;
        case 409:
          message = data?.error || 'El recurso ya existe';
          break;
        case 429:
          message = 'Demasiadas solicitudes. Por favor, espera un momento.';
          break;
        case 500:
          message = 'Error del servidor. Por favor, intenta más tarde.';
          break;
        case 503:
          message = 'Servicio no disponible. Por favor, intenta más tarde.';
          break;
        default:
          message = data?.error || data?.message || fallbackMessage;
      }

      // Si hay detalles de validación, mostrarlos
      if (data?.details && Array.isArray(data.details)) {
        message = data.details.map(d => d.message).join(', ');
      }
    } else if (error?.request) {
      // Error de red (sin respuesta del servidor)
      message = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error?.message) {
      // Error de JavaScript
      message = error.message;
    }

    // Mostrar toast si está habilitado
    if (showToastOption) {
      showToast(message, 'error');
    }

    // Retornar error para manejo adicional si es necesario
    return {
      message,
      error,
      handled: true,
    };
  }, [showToast]);

  const handleAsyncError = useCallback(async (asyncFn, options = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      return handleError(error, options);
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};
```

### Ejemplo de uso en componente

```javascript
import { useErrorHandler } from '../hooks/useErrorHandler';
import api from '../services/api';

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/data');
      setData(response.data);
    } catch (error) {
      handleError(error, {
        fallbackMessage: 'No se pudo cargar la información',
      });
    } finally {
      setLoading(false);
    }
  };

  // O usando handleAsyncError
  const fetchDataAlt = async () => {
    setLoading(true);
    const result = await handleAsyncError(
      async () => {
        const response = await api.get('/api/data');
        setData(response.data);
        return response.data;
      },
      {
        fallbackMessage: 'No se pudo cargar la información',
      }
    );
    setLoading(false);
    return result;
  };

  // ...
}
```

---

## 🔴 Frontend: Componente de Loading State Reutilizable

### Crear `src/components/LoadingState.jsx`

```javascript
import React from 'react';

/**
 * Componente de loading state reutilizable
 */
const LoadingState = ({ 
  message = 'Cargando...', 
  variant = 'spinner', // 'spinner' | 'skeleton' | 'dots'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-8';

  if (variant === 'skeleton') {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="w-full space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {message && <p className="ml-4 text-gray-600 dark:text-gray-400">{message}</p>}
      </div>
    );
  }

  // Default: spinner
  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`${sizeClasses[size]} border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}
        />
        {message && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
```

### Crear `src/components/SkeletonLoader.jsx` para casos específicos

```javascript
import React from 'react';

/**
 * Skeleton loader para diferentes tipos de contenido
 */
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 animate-pulse">
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"
          />
        ))}
      </div>
    ))}
  </div>
);
```

---

## 🔴 Frontend: Reemplazar console.log

### Crear `src/utils/logger.js`

```javascript
/**
 * Sistema de logging para el frontend
 * Reemplaza console.log con un sistema más robusto
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor() {
    this.level = import.meta.env.PROD ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
    this.enableRemoteLogging = import.meta.env.PROD && import.meta.env.VITE_ENABLE_REMOTE_LOGGING === 'true';
  }

  shouldLog(level) {
    return level >= this.level;
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(
      key => LOG_LEVELS[key] === level
    );
    return `[${timestamp}] [${levelName}] ${message}`;
  }

  sendToRemote(level, message, ...args) {
    if (!this.enableRemoteLogging) return;

    // Enviar a servicio de logging remoto (Sentry, LogRocket, etc.)
    try {
      // Ejemplo con fetch (ajustar según tu servicio)
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          args,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silenciar errores de logging remoto
      });
    } catch (error) {
      // Silenciar errores
    }
  }

  debug(message, ...args) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    const formatted = this.formatMessage(LOG_LEVELS.DEBUG, message);
    console.debug(formatted, ...args);
    this.sendToRemote(LOG_LEVELS.DEBUG, message, ...args);
  }

  info(message, ...args) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    const formatted = this.formatMessage(LOG_LEVELS.INFO, message);
    console.info(formatted, ...args);
    this.sendToRemote(LOG_LEVELS.INFO, message, ...args);
  }

  warn(message, ...args) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    const formatted = this.formatMessage(LOG_LEVELS.WARN, message);
    console.warn(formatted, ...args);
    this.sendToRemote(LOG_LEVELS.WARN, message, ...args);
  }

  error(message, ...args) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    const formatted = this.formatMessage(LOG_LEVELS.ERROR, message);
    console.error(formatted, ...args);
    this.sendToRemote(LOG_LEVELS.ERROR, message, ...args);

    // Enviar a Sentry si está configurado
    if (window.Sentry) {
      window.Sentry.captureException(new Error(message), {
        extra: args,
      });
    }
  }
}

// Exportar instancia singleton
const logger = new Logger();

// Exportar también funciones individuales para compatibilidad
export const log = {
  debug: (...args) => logger.debug(...args),
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
};

export default logger;
```

### Uso en componentes

```javascript
// Antes
console.log('Datos cargados:', data);
console.error('Error:', error);

// Después
import logger from '../utils/logger';

logger.debug('Datos cargados:', data);
logger.error('Error:', error);
```

---

## 📝 Notas de Implementación

1. **Priorizar**: Implementar primero el manejo de errores y health checks
2. **Testing**: Agregar tests para cada nueva funcionalidad
3. **Documentación**: Actualizar README con nuevas características
4. **Migración gradual**: No reemplazar todo de una vez, hacerlo por módulos

---

**Última actualización**: $(date)

