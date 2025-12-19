import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import api from '../services/api';
import useToastStore from '../stores/useToastStore';
import useUserStore from '../stores/useUserStore';
import logger from '../utils/logger';

/**
 * Sistema de mensajería básico entre coach y cliente
 * Para implementación completa con WebSockets, requiere backend adicional
 */
const MessagingSystem = ({ recipientId, recipientEmail, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useUserStore((state) => state.user);
  const toast = useToastStore();

  useEffect(() => {
    fetchMessages();
    // En producción, aquí se establecería la conexión WebSocket
    // const ws = new WebSocket(`ws://api/messages/${recipientId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Nota: Este endpoint necesita ser implementado en el backend
      // Por ahora, simulamos datos vacíos
      const response = await api.get(`/messages/conversation/${recipientId}`).catch(() => ({
        data: { messages: [] },
      }));
      setMessages(response.data.messages || []);
    } catch (error) {
      logger.error('Error al cargar mensajes:', error);
      toast.error('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Nota: Este endpoint necesita ser implementado en el backend
      const response = await api.post('/messages', {
        recipient_id: recipientId,
        content: messageText,
      });

      const sentMessage = response.data.message || {
        message_id: Date.now(),
        sender_id: user.user_id,
        recipient_id: recipientId,
        content: messageText,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, sentMessage]);
      scrollToBottom();
    } catch (error) {
      logger.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar mensaje');
      setNewMessage(messageText); // Restaurar mensaje si falla
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mensajes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {recipientEmail}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar mensajería"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No hay mensajes aún. Comienza la conversación.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user.user_id;
              return (
                <div
                  key={message.message_id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn
                          ? 'text-blue-100 dark:text-blue-200'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Adjuntar archivo"
            >
              <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Enviar mensaje"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessagingSystem;

