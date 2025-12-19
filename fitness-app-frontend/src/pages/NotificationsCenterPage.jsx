import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import api from '../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Check, Trash2, Filter, Settings } from 'lucide-react';
import useToastStore from '../stores/useToastStore';
import logger from '../utils/logger';
import { NotificationsCenterPageSkeleton } from '../components/NotificationsCenterPageSkeleton';

/**
 * Página completa del centro de notificaciones
 * Permite ver, filtrar y gestionar todas las notificaciones
 */
const NotificationsCenterPage = () => {
    const toast = useToastStore();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, [filter, page]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(filter === 'unread' && { unread: 'true' }),
            });
            const response = await api.get(`/notifications?${params}`);
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
            logger.error('Error al cargar notificaciones:', error);
            toast.error('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Notificación marcada como leída');
        } catch (error) {
            logger.error('Error al marcar notificación:', error);
            toast.error('Error al marcar notificación');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            logger.error('Error al marcar todas como leídas:', error);
            toast.error('Error al marcar todas como leídas');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
            const notification = notifications.find(n => n.notification_id === notificationId);
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            toast.success('Notificación eliminada');
        } catch (error) {
            logger.error('Error al eliminar notificación:', error);
            toast.error('Error al eliminar notificación');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'success': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
            case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
            case 'achievement': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
            case 'reminder': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'read') return n.is_read;
        return true;
    });

    return (
        <AppLayout>
            <PageContainer
                title="Centro de Notificaciones"
                description="Gestiona todas tus notificaciones"
            >
                {/* Header con filtros */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>
                </div>

                {/* Filtros */}
                <div className="mb-6 flex items-center gap-2 flex-wrap">
                    <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    {['all', 'unread', 'read'].map((f) => (
                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f);
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                filter === f
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {f === 'all' ? 'Todas' : f === 'unread' ? 'Sin leer' : 'Leídas'}
                        </button>
                    ))}
                </div>

                {/* Lista de notificaciones */}
                {loading ? (
                    <NotificationsCenterPageSkeleton />
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50">
                        <Bell className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                            No hay notificaciones {filter !== 'all' ? `(${filter === 'unread' ? 'sin leer' : 'leídas'})` : ''}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            {filter === 'all' ? 'Tus notificaciones aparecerán aquí' : 'Intenta cambiar el filtro'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.notification_id}
                                className={`backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 p-6 transition-all hover:shadow-lg ${
                                    !notification.is_read ? 'ring-2 ring-blue-500/20' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${!notification.is_read ? 'font-bold' : ''}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.is_read && (
                                                <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                                {' • '}
                                                {format(new Date(notification.created_at), 'd MMM yyyy, HH:mm', { locale: es })}
                                            </p>
                                            <div className="flex gap-2">
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.notification_id)}
                                                        className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Marcar leída
                                                    </button>
                                                )}
                                                {notification.link_url && (
                                                    <a
                                                        href={notification.link_url}
                                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        Ver más
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.notification_id)}
                                                    className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </PageContainer>
        </AppLayout>
    );
};

export default NotificationsCenterPage;

