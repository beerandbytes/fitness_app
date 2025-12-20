import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useUserStore from '../stores/useUserStore';
import api from '../services/api';
import logger from '../utils/logger';

// Componente que verifica si el usuario necesita completar el onboarding
const OnboardingGuard = ({ children }) => {
    const user = useUserStore((state) => state.user);
    const authLoading = useUserStore((state) => state.loading);
    const location = useLocation();
    const [onboardingStatus, setOnboardingStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkOnboarding = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/onboarding/status');
                setOnboardingStatus(response.data);
            } catch (error) {
                logger.error('Error al verificar estado de onboarding:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            checkOnboarding();
        }
    }, [user, authLoading]);

    // Si está cargando, mostrar spinner
    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#FAF3E1] dark:bg-black transition-colors duration-300">
                <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Los coaches y admins no necesitan completar onboarding
    const isCoach = user?.role === 'COACH';
    const isAdmin = user?.role === 'ADMIN';
    const isCoachOrAdmin = isCoach || isAdmin;

    // Derivar un estado de "onboarding completado" más robusto
    // Solo consideramos completado si es coach/admin o si el backend marca onboarding_completed = true
    const isOnboardingCompleted = isCoachOrAdmin || (onboardingStatus && onboardingStatus.onboarding_completed);

    // Si no hay usuario, redirigir a login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si el usuario no ha completado el onboarding y no está en /welcome, redirigir
    // Solo redirigir si tenemos el estado de onboarding cargado
    if (
        onboardingStatus !== null &&
        !isOnboardingCompleted &&
        location.pathname !== '/welcome' &&
        location.pathname !== '/select-role'
    ) {
        return <Navigate to="/welcome" replace />;
    }

    // Si el usuario es admin y está en /welcome, redirigir a su dashboard de admin
    if (isAdmin && location.pathname === '/welcome') {
        return <Navigate to="/admin" replace />;
    }

    // Si el usuario es coach y está en /welcome, redirigir a su dashboard de coach
    if (isCoach && location.pathname === '/welcome') {
        return <Navigate to="/coach/dashboard" replace />;
    }

    // Si el usuario ha completado el onboarding y está en /welcome, redirigir a dashboard
    if (
        onboardingStatus !== null &&
        isOnboardingCompleted &&
        location.pathname === '/welcome'
    ) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default OnboardingGuard;
