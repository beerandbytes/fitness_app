import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Banner de estado offline que muestra cuando el usuario no tiene conexión
 * y gestiona la cola de acciones pendientes
 */
const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  const [showBanner, setShowBanner] = useState(false);

  // Sincronizar acciones pendientes cuando vuelve la conexión
  const syncPendingActions = useCallback(async () => {
    const savedActions = localStorage.getItem('pendingActions');
    if (!savedActions) return;

    try {
      const actions = JSON.parse(savedActions);
      if (actions.length === 0) return;

      // Aquí se implementaría la lógica para reenviar las acciones
      // Por ahora, solo limpiamos después de un tiempo
      setTimeout(() => {
        localStorage.removeItem('pendingActions');
        setPendingActions([]);
      }, 2000);
    } catch (e) {
      console.error('Error al sincronizar acciones:', e);
    }
  }, []);

  // Guardar acción pendiente en localStorage
  const addPendingAction = (action) => {
    const savedActions = localStorage.getItem('pendingActions');
    const actions = savedActions ? JSON.parse(savedActions) : [];
    actions.push({
      ...action,
      timestamp: Date.now(),
    });
    localStorage.setItem('pendingActions', JSON.stringify(actions));
    setPendingActions(actions);
    setShowBanner(true);
  };

  // Exponer función para agregar acciones pendientes y manejar eventos de conexión
  useEffect(() => {
    // Detectar cambios en el estado de conexión
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
      // Intentar sincronizar acciones pendientes
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    // Cargar acciones pendientes del localStorage
    const savedActions = localStorage.getItem('pendingActions');
    if (savedActions) {
      try {
        const actions = JSON.parse(savedActions);
        setPendingActions(actions);
        if (actions.length > 0 && !navigator.onLine) {
          setShowBanner(true);
        }
      } catch (e) {
        console.error('Error al cargar acciones pendientes:', e);
      }
    }

    // Exponer función para agregar acciones pendientes
    window.addPendingAction = addPendingAction;

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      delete window.addPendingAction;
    };
  }, [syncPendingActions]);

  if (!showBanner && isOnline) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 text-white shadow-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <>
                    <Wifi className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Conexión restaurada</p>
                      {pendingActions.length > 0 && (
                        <p className="text-xs opacity-90">
                          Sincronizando {pendingActions.length} acción{pendingActions.length > 1 ? 'es' : ''} pendiente{pendingActions.length > 1 ? 's' : ''}...
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Sin conexión a internet</p>
                      <p className="text-xs opacity-90">
                        {pendingActions.length > 0
                          ? `${pendingActions.length} acción${pendingActions.length > 1 ? 'es' : ''} pendiente${pendingActions.length > 1 ? 's' : ''} se sincronizarán cuando vuelva la conexión`
                          : 'Algunas funciones pueden no estar disponibles'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="ml-4 p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Cerrar banner"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;

