/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
// NOTA: Debes instalar react-router-dom para que 'useNavigate' funcione: npm install react-router-dom
import { useNavigate } from 'react-router-dom'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Datos del usuario (email, id, isAdmin)
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const navigate = useNavigate();

  // Función para cargar/verificar el usuario al iniciar la aplicación o después del login
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        // Usamos la ruta protegida /api/profile para verificar si el token es válido
        const response = await api.get('/profile'); 
        // El backend devuelve el perfil en response.data.profile
        setUser(response.data.profile); 
      } catch (error) {
        console.error('Token inválido/expirado, forzando logout:', error);
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('userId'); 
        setUser(null);
      }
    }
    // Usar setTimeout para evitar setState sincrónico en efecto
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]); 

  // Funciones de Autenticación - memoizadas para evitar recreaciones
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { 
      email, 
      password,
    });
    
    const { token, refreshToken, user } = response.data;
    localStorage.setItem('userToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('userId', user.id);
    setUser(user);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const register = useCallback(async (email, password) => {
    const response = await api.post('/auth/register', { 
      email, 
      password,
    });
    
    // El registro también devuelve token e inicia sesión
    const { token, refreshToken, user } = response.data;
    localStorage.setItem('userToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('userId', user.id);
    setUser(user); 
    // Redirigir a welcome para onboarding
    navigate('/welcome', { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // Función para refrescar el token de acceso
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('userToken', token);
      
      // Si el backend devuelve un nuevo refreshToken, actualizarlo también
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      return token;
    } catch (error) {
      // Si el refresh falla, hacer logout
      logout();
      throw error;
    }
  }, [logout]);

  // Memoizar el objeto value para evitar recreaciones innecesarias
  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshAccessToken,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
  }), [user, loading, login, register, logout, refreshAccessToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};