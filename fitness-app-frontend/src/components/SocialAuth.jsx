import React from 'react';
import SocialAuthButtons from './SocialAuthButtons';
import { Chrome, Mail } from 'lucide-react';

/**
 * Componente de autenticación social
 * Para implementación completa, requiere configuración OAuth en backend
 */
const SocialAuth = ({ onGoogleLogin, onEmailLogin, loading = false }) => {
  const handleGoogleLogin = async () => {
    if (onGoogleLogin) {
      try {
        // Redirigir a endpoint OAuth de Google
        // En producción, esto debería ser manejado por el backend
        window.location.href = '/api/auth/google';
      } catch (error) {
        console.error('Error en autenticación Google:', error);
      }
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Chrome className="w-5 h-5" />
        Continuar con Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            o
          </span>
        </div>
      </div>

      {onEmailLogin && (
        <button
          type="button"
          onClick={onEmailLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-5 h-5" />
          Continuar con Email
        </button>
      )}
    </div>
  );
};

export default SocialAuth;

