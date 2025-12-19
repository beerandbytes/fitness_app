/**
 * Utilidades de analytics y tracking
 * Configuración centralizada para analytics
 */

// Configuración de analytics
const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const ANALYTICS_ID = import.meta.env.VITE_ANALYTICS_ID;

/**
 * Inicializar analytics (Google Analytics, etc.)
 */
export const initAnalytics = () => {
  if (!ANALYTICS_ENABLED || !ANALYTICS_ID) {
    return;
  }

  // Aquí se puede inicializar Google Analytics u otro servicio
  // Por ahora, solo logging en desarrollo
  if (import.meta.env.DEV) {
    console.log('[Analytics] Inicializado (modo desarrollo)');
  }
};

/**
 * Trackear evento
 */
export const trackEvent = (eventName, eventData = {}) => {
  if (!ANALYTICS_ENABLED) {
    return;
  }

  // En desarrollo, solo log
  if (import.meta.env.DEV) {
    console.log('[Analytics Event]', eventName, eventData);
    return;
  }

  // En producción, enviar a servicio de analytics
  // Ejemplo para Google Analytics:
  // if (window.gtag) {
  //   window.gtag('event', eventName, eventData);
  // }
};

/**
 * Trackear página vista
 */
export const trackPageView = (path) => {
  if (!ANALYTICS_ENABLED) {
    return;
  }

  if (import.meta.env.DEV) {
    console.log('[Analytics PageView]', path);
    return;
  }

  // En producción:
  // if (window.gtag) {
  //   window.gtag('config', ANALYTICS_ID, {
  //     page_path: path,
  //   });
  // }
};

/**
 * Trackear errores
 */
export const trackError = (error, context = {}) => {
  if (!ANALYTICS_ENABLED) {
    return;
  }

  const errorData = {
    message: error.message,
    stack: error.stack,
    ...context,
  };

  if (import.meta.env.DEV) {
    console.error('[Analytics Error]', errorData);
    return;
  }

  // En producción, enviar a servicio de error tracking (Sentry, etc.)
  // Ejemplo:
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }
};

/**
 * Eventos predefinidos comunes
 */
export const AnalyticsEvents = {
  // Autenticación
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // Acciones del usuario
  EXERCISE_ADDED: 'exercise_added',
  WEIGHT_LOGGED: 'weight_logged',
  FOOD_LOGGED: 'food_logged',
  ROUTINE_CREATED: 'routine_created',
  ROUTINE_COMPLETED: 'routine_completed',

  // Coach
  CLIENT_INVITED: 'client_invited',
  TEMPLATE_ASSIGNED: 'template_assigned',

  // Errores
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
};

