import React from 'react';
import api from '../services/api';
import useUserStore from '../stores/useUserStore';
import useToastStore from '../stores/useToastStore';
import logger from '../utils/logger';

/**
 * Componente de botones de autenticación social
 * Google OAuth y Facebook OAuth
 */
const SocialAuthButtons = ({ onSuccess, onError }) => {
    const login = useUserStore((state) => state.login);
    const toast = useToastStore();

    const handleGoogleAuth = async () => {
        try {
            // En producción, usar Google OAuth SDK
            // Por ahora, simulamos con datos de prueba
            toast.info('Autenticación con Google - Requiere configuración de OAuth');
            
            // TODO: Implementar Google OAuth SDK
            // const response = await api.post('/auth/social/google', {
            //     idToken: googleIdToken,
            //     email: profile.email,
            //     name: profile.name,
            //     picture: profile.picture,
            // });
            
            // if (response.data.token && login) {
            //     login(response.data.token, response.data.user);
            //     if (onSuccess) onSuccess();
            // }
        } catch (error) {
            logger.error('Error en autenticación Google:', error);
            toast.error('Error al autenticarse con Google');
            if (onError) onError(error);
        }
    };

    const handleFacebookAuth = async () => {
        try {
            // En producción, usar Facebook OAuth SDK
            toast.info('Autenticación con Facebook - Requiere configuración de OAuth');
            
            // TODO: Implementar Facebook OAuth SDK
            // const response = await api.post('/auth/social/facebook', {
            //     accessToken: facebookAccessToken,
            //     email: profile.email,
            //     name: profile.name,
            //     picture: profile.picture,
            // });
            
            // if (response.data.token && login) {
            //     login(response.data.token, response.data.user);
            //     if (onSuccess) onSuccess();
            // }
        } catch (error) {
            logger.error('Error en autenticación Facebook:', error);
            toast.error('Error al autenticarse con Facebook');
            if (onError) onError(error);
        }
    };

    return (
        <div className="space-y-3">
            <button
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Iniciar sesión con Google"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Continuar con Google
            </button>

            <button
                onClick={handleFacebookAuth}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-xl font-medium hover:bg-[#166FE5] transition-colors"
                aria-label="Iniciar sesión con Facebook"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continuar con Facebook
            </button>
        </div>
    );
};

export default SocialAuthButtons;

