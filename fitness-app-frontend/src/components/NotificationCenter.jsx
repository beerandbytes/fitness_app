import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, ExternalLink } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

/**
 * Centro de notificaciones mejorado
 * Muestra notificaciones persistentes y permite gestionarlas
 */
const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar notificaciones del localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filtrar notificaciones expiradas
        const active = parsed.filter(n => {
          if (n.expiresAt) {
            return new Date(n.expiresAt) > new Date();
          }
          return true;
        });
        // Usar setTimeout para evitar setState síncrono en efecto
        setTimeout(() => {
          setNotifications(active);
          localStorage.setItem('app_notifications', JSON.stringify(active));
        }, 0);
      }
    } catch (e) {
      logger.error('Error al cargar notificaciones:', e);
    }
  }, []);

  // Guardar notificaciones en localStorage
  const saveNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    try {
      localStorage.setItem('app_notifications', JSON.stringify(newNotifications));
    } catch (e) {
      logger.error('Error al guardar notificaciones:', e);
    }
  };

  // Agregar notificación (no usado actualmente, pero puede ser útil para futuras implementaciones)
  // eslint-disable-next-line no-unused-vars
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      action: notification.action,
      createdAt: new Date().toISOString(),
      expiresAt: notification.expiresAt,
      read: false,
    };

    const updated = [newNotification, ...notifications];
    saveNotifications(updated);
    return newNotification.id;
  };

  // Marcar como leída
  const markAsRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  // Eliminar notificación
  const removeNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  // Limpiar todas las notificaciones
  const clearAll = () => {
    saveNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-4 w-96 max-h-[600px] overflow-hidden flex flex-col z-[10000]"
          sideOffset={5}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                title="Ver todas las notificaciones"
              >
                Ver todas
                <ExternalLink className="w-3 h-3" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Marcar todas como leídas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay notificaciones
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-xl border transition-all ${
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800'
                      : getTypeStyles(notification.type)
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      {notification.action && (
                        <button
                          onClick={() => {
                            if (notification.action.onClick) {
                              notification.action.onClick();
                            }
                            markAsRead(notification.id);
                          }}
                          className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {notification.action.label}
                        </button>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-start gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          aria-label="Marcar como leída"
                        >
                          <Check className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        aria-label="Eliminar"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default NotificationCenter;

// Hook para usar notificaciones desde cualquier componente
export const useNotifications = () => {
  const addNotification = (notification) => {
    // Disparar evento personalizado para que NotificationCenter lo capture
    window.dispatchEvent(
      new CustomEvent('addNotification', { detail: notification })
    );
  };

  return { addNotification };
};

