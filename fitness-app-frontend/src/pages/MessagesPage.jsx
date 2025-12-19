import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import api from '../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, MessageCircle, Users, ArrowLeft } from 'lucide-react';
import useToastStore from '../stores/useToastStore';
import logger from '../utils/logger';
import { MessagesPageSkeleton } from '../components/MessagesPageSkeleton';
import { connectSocket, disconnectSocket, getSocket, joinConversation, leaveConversation, markMessagesAsRead } from '../utils/socket';

/**
 * Página de mensajería para comunicación entre usuarios y coaches
 */
const MessagesPage = () => {
    const toast = useToastStore();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showConversationView, setShowConversationView] = useState(false); // Para móvil: false = lista, true = conversación
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        // Conectar WebSocket al montar
        connectSocket();
        
        return () => {
            // Desconectar al desmontar
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.userId);
            // Unirse a la conversación en WebSocket
            joinConversation(selectedConversation.userId);
            
            // Escuchar nuevos mensajes en tiempo real
            const socket = getSocket();
            if (socket) {
                const handleNewMessage = (message) => {
                    // Solo agregar si es para esta conversación
                    if (
                        (message.sender_id === selectedConversation.userId && message.receiver_id === socket.userId) ||
                        (message.receiver_id === selectedConversation.userId && message.sender_id === socket.userId)
                    ) {
                        setMessages(prev => [...prev, message]);
                        // Marcar como leído si somos el receptor
                        if (message.receiver_id === socket.userId) {
                            markMessagesAsRead(message.sender_id);
                        }
                    }
                };

                socket.on('new_message', handleNewMessage);

                return () => {
                    socket.off('new_message', handleNewMessage);
                    leaveConversation(selectedConversation.userId);
                };
            }
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/messages/conversations');
            setConversations(response.data.conversations || []);
        } catch (error) {
            logger.error('Error al cargar conversaciones:', error);
            toast.error('Error al cargar conversaciones');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await api.get(`/messages/conversation/${userId}`);
            setMessages(response.data.messages || []);
        } catch (error) {
            logger.error('Error al cargar mensajes:', error);
            toast.error('Error al cargar mensajes');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic update
        const tempMessage = {
            message_id: Date.now(),
            sender_id: null, // Se actualizará con el ID real
            receiver_id: selectedConversation.userId,
            content: messageContent,
            created_at: new Date().toISOString(),
            is_read: false,
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await api.post('/messages', {
                receiver_id: selectedConversation.userId,
                content: messageContent,
            });
            
            // Reemplazar mensaje temporal con el real
            setMessages(prev => prev.map(m => 
                m.message_id === tempMessage.message_id 
                    ? response.data.data 
                    : m
            ));
            
            // Actualizar última conversación
            fetchConversations();
        } catch (error) {
            logger.error('Error al enviar mensaje:', error);
            toast.error('Error al enviar mensaje');
            // Revertir optimistic update
            setMessages(prev => prev.filter(m => m.message_id !== tempMessage.message_id));
            setNewMessage(messageContent);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <MessagesPageSkeleton />;
    }

    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        // En móvil, mostrar la vista de conversación
        setShowConversationView(true);
    };

    const handleBackToList = () => {
        setShowConversationView(false);
    };

    return (
        <AppLayout>
            <PageContainer
                title="Mensajes"
                description="Comunícate con tu coach o clientes"
            >
                <div className="flex h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-200px)] md:h-[calc(100vh-200px)] min-h-[500px] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-black/60">
                    {/* Lista de conversaciones */}
                    <div className={`${showConversationView ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-1/3 border-r border-gray-200 dark:border-gray-800 overflow-hidden`}>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Conversaciones
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                                    <p className="text-sm">No hay conversaciones</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {conversations.map((conv) => (
                                        <button
                                            key={conv.userId}
                                            onClick={() => handleSelectConversation(conv)}
                                            className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[72px] flex items-center ${
                                                selectedConversation?.userId === conv.userId
                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 w-full min-w-0">
                                                <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                    {conv.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {conv.userName}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                        {conv.lastMessage}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Área de mensajes */}
                    <div className={`${showConversationView ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-w-0`}>
                        {selectedConversation ? (
                            <>
                                {/* Header de conversación */}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 flex items-center gap-3">
                                    <button
                                        onClick={handleBackToList}
                                        className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                        aria-label="Volver a conversaciones"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0">
                                        {selectedConversation.userName}
                                    </h3>
                                </div>

                                {/* Mensajes */}
                                <div
                                    ref={messagesContainerRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
                                >
                                    {messages.map((message) => {
                                        const isOwn = message.sender_id !== selectedConversation.userId;
                                        return (
                                            <div
                                                key={message.message_id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 ${
                                                        isOwn
                                                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                                    }`}
                                                >
                                                    <p className="text-sm break-words">{message.content}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            isOwn
                                                                ? 'text-blue-100'
                                                                : 'text-gray-500 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {formatDistanceToNow(new Date(message.created_at), {
                                                            addSuffix: true,
                                                            locale: es,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input de mensaje */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Escribe un mensaje..."
                                            className="flex-1 px-4 py-3 md:py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white text-base md:text-sm"
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="px-4 py-3 md:py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[88px] md:min-w-0 justify-center"
                                            aria-label="Enviar mensaje"
                                        >
                                            <Send className="w-5 h-5" />
                                            <span className="md:hidden">Enviar</span>
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                <div className="text-center">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                                    <p>Selecciona una conversación para comenzar</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PageContainer>
        </AppLayout>
    );
};

export default MessagesPage;

