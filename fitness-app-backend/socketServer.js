const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Configurar servidor de WebSockets para mensajería en tiempo real
 */
function setupSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Middleware de autenticación para WebSockets
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('No token provided'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.id;
            socket.userEmail = decoded.email;
            next();
        } catch (error) {
            logger.error('Socket authentication error:', error);
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Usuario conectado: ${socket.userId} (${socket.userEmail})`);

        // Unirse a una sala de conversación
        socket.on('join_conversation', (otherUserId) => {
            const roomId = [socket.userId, otherUserId].sort().join('_');
            socket.join(roomId);
            logger.info(`Usuario ${socket.userId} se unió a la conversación ${roomId}`);
        });

        // Salir de una conversación
        socket.on('leave_conversation', (otherUserId) => {
            const roomId = [socket.userId, otherUserId].sort().join('_');
            socket.leave(roomId);
            logger.info(`Usuario ${socket.userId} salió de la conversación ${roomId}`);
        });

        // Enviar mensaje
        socket.on('send_message', async (data) => {
            const { receiver_id, content } = data;
            
            if (!receiver_id || !content) {
                socket.emit('error', { message: 'receiver_id y content son requeridos' });
                return;
            }

            // Crear el mensaje (esto debería guardarse en la BD, pero por ahora solo lo emitimos)
            const message = {
                sender_id: socket.userId,
                receiver_id,
                content,
                created_at: new Date().toISOString(),
                is_read: false,
            };

            // Enviar a ambos usuarios en la conversación
            const roomId = [socket.userId, receiver_id].sort().join('_');
            io.to(roomId).emit('new_message', message);

            logger.info(`Mensaje enviado de ${socket.userId} a ${receiver_id}`);
        });

        // Marcar mensajes como leídos
        socket.on('mark_read', (data) => {
            const { sender_id } = data;
            const roomId = [socket.userId, sender_id].sort().join('_');
            
            // Notificar al remitente que sus mensajes fueron leídos
            socket.to(roomId).emit('messages_read', {
                reader_id: socket.userId,
                sender_id,
            });
        });

        socket.on('disconnect', () => {
            logger.info(`Usuario desconectado: ${socket.userId}`);
        });
    });

    return io;
}

module.exports = { setupSocketServer };








