import { io } from 'socket.io-client';
import logger from './logger';

// Para WebSocket, necesitamos la URL completa. Si no está definida, usar ruta relativa
// que será resuelta por el proxy de nginx
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : window.location.origin);

let socket = null;

/**
 * Conectar al servidor WebSocket
 */
export const connectSocket = () => {
    if (socket?.connected) {
        return socket;
    }

    const token = localStorage.getItem('userToken');
    
    if (!token) {
        logger.warn('No hay token disponible para conectar WebSocket');
        return null;
    }

    socket = io(API_URL, {
        auth: {
            token,
        },
        transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
        logger.info('Conectado al servidor WebSocket');
    });

    socket.on('disconnect', () => {
        logger.warn('Desconectado del servidor WebSocket');
    });

    socket.on('error', (error) => {
        logger.error('Error en WebSocket:', error);
    });

    return socket;
};

/**
 * Desconectar del servidor WebSocket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Obtener la instancia del socket
 */
export const getSocket = () => {
    if (!socket || !socket.connected) {
        return connectSocket();
    }
    return socket;
};

/**
 * Unirse a una conversación
 */
export const joinConversation = (otherUserId) => {
    const s = getSocket();
    if (s) {
        s.emit('join_conversation', otherUserId);
    }
};

/**
 * Salir de una conversación
 */
export const leaveConversation = (otherUserId) => {
    const s = getSocket();
    if (s) {
        s.emit('leave_conversation', otherUserId);
    }
};

/**
 * Enviar mensaje a través de WebSocket
 */
export const sendMessageViaSocket = (receiverId, content) => {
    const s = getSocket();
    if (s) {
        s.emit('send_message', { receiver_id: receiverId, content });
    }
};

/**
 * Marcar mensajes como leídos
 */
export const markMessagesAsRead = (senderId) => {
    const s = getSocket();
    if (s) {
        s.emit('mark_read', { sender_id: senderId });
    }
};

export default {
    connectSocket,
    disconnectSocket,
    getSocket,
    joinConversation,
    leaveConversation,
    sendMessageViaSocket,
    markMessagesAsRead,
};








