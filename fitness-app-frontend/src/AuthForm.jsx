import React, { useState, useEffect } from 'react';
import useUserStore from './stores/useUserStore';
import useBrandStore from './stores/useBrandStore';
import { useLocation, useNavigate } from 'react-router-dom';
import ValidatedInput from './components/ValidatedInput';
import SocialAuth from './components/SocialAuth';
import { emailValidator, passwordValidator } from './utils/validators';

const AuthForm = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    const navigate = useNavigate();

    const login = useUserStore((state) => state.login);
    const register = useUserStore((state) => state.register);
    const isAuthenticated = useUserStore((state) => state.isAuthenticated());
    const user = useUserStore((state) => state.user);
    const brandSettings = useBrandStore((state) => state.brandSettings);

    // Obtener la primera letra del nombre de la marca para el logo
    const brandFirstLetter = brandSettings.brand_name?.charAt(0).toUpperCase() || 'F';

    const handleNavigation = (currentUser) => {
        if (!currentUser) return;

        if (!currentUser.role || currentUser.role === null) {
            navigate('/select-role', { replace: true });
        } else if (currentUser.role === 'ADMIN') {
            navigate('/admin', { replace: true });
        } else if (currentUser.role === 'COACH') {
            navigate('/coach/dashboard', { replace: true });
        } else {
            navigate('/dashboard', { replace: true });
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            // Solo redirigir si el usuario ya está autenticado al cargar (no durante el flujo de submit)
            handleNavigation(user);
        }
    }, [isAuthenticated, user, navigate]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const result = await login(email, password, null, navigate);
                if (!result.success) {
                    setError(result.error);
                    setLoading(false);
                    return;
                }
                // Si el store no redirige automáticamente, lo hacemos nosotros
                if (result.user) handleNavigation(result.user);
            } else {
                const result = await register(email, password, null, navigate);
                if (!result.success) {
                    const errorMsg = result.error || 'Error al registrarse';
                    const details = result.details;
                    if (details && Array.isArray(details) && details.length > 0) {
                        setError(details.map(d => d.message).join(', '));
                    } else {
                        setError(errorMsg);
                    }
                    setLoading(false);
                    return;
                }
                // Redirigir explícitamente después de registrarse satisfactoriamente
                if (result.user) handleNavigation(result.user);
            }
        } catch (err) {
            setError(err.error || 'Ocurrió un error al procesar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF3E1] dark:bg-black p-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                {/* Logo y Header */}
                <div className="text-center mb-10">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        {brandSettings.logo_url ? (
                            <img
                                src={brandSettings.logo_url}
                                alt={brandSettings.brand_name}
                                className="w-20 h-20 rounded-3xl object-cover shadow-xl shadow-blue-500/20 dark:shadow-blue-600/20"
                                onError={(e) => {
                                    // Si la imagen falla al cargar, ocultar y mostrar el fallback
                                    e.target.style.display = 'none';
                                    const fallback = e.target.parentElement.querySelector('.logo-fallback');
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={`logo-fallback w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-600 dark:to-pink-500 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 dark:shadow-blue-600/20 ${brandSettings.logo_url ? 'hidden absolute inset-0' : ''}`}
                        >
                            <span className="text-white font-bold text-3xl">{brandFirstLetter}</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
                        {isLogin ? 'Bienvenido' : 'Crea tu cuenta'}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
                        {isLogin ? 'Continúa tu progreso' : 'Comienza tu transformación'}
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8">
                    {/* Autenticación Social */}
                    {!isLogin && (
                        <div className="mb-6">
                            <SocialAuth
                                onGoogleLogin={() => {
                                    // Redirigir a endpoint OAuth
                                    window.location.href = '/api/auth/google';
                                }}
                                loading={loading}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <ValidatedInput
                            label="Correo electrónico"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            validator={emailValidator}
                            placeholder="tu@email.com"
                            required
                        />

                        <ValidatedInput
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            validator={isLogin ? null : passwordValidator}
                            placeholder="••••••••"
                            required
                            {...(!isLogin && { minLength: 8 })}
                            successMessage={!isLogin ? "Contraseña segura" : null}
                        />
                        {!isLogin && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                                Mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y carácter especial (@$!%*?&)
                            </p>
                        )}

                        {isLogin && (
                            <div className="flex justify-end -mt-2">
                                <button
                                    type="button"
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-brand dark:bg-blue-500 text-white rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Procesando...
                                </>
                            ) : (
                                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                            )}
                        </button>
                    </form>

                    {/* Enlace de cambio */}
                    <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-light">
                            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                        </span>
                        <button
                            type="button"
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity ml-1"
                            onClick={() => navigate(isLogin ? '/register' : '/login')}
                        >
                            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
