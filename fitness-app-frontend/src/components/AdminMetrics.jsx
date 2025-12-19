import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, Calendar, BarChart3, UtensilsCrossed, Dumbbell, Apple } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import logger from '../utils/logger';

/**
 * Dashboard de métricas para administradores
 * Muestra estadísticas del sistema y uso de la plataforma
 */
const AdminMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/metrics?period=${period}`);
      setMetrics(response.data);
    } catch (error) {
      logger.error('Error al cargar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No hay métricas disponibles</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Usuarios',
      value: metrics.users.total,
      change: `+${metrics.users.new} este ${period === 'week' ? 'semana' : period === 'month' ? 'mes' : 'año'}`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Usuarios Activos',
      value: metrics.activity.uniqueExerciseDays + metrics.activity.uniqueMealDays,
      change: `${metrics.users.completedOnboarding} completaron onboarding`,
      icon: Activity,
      color: 'green',
    },
    {
      title: 'Coaches',
      value: metrics.users.coaches,
      change: `${((metrics.users.coaches / metrics.users.total) * 100).toFixed(0)}% del total`,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Clientes',
      value: metrics.users.clients,
      change: `${((metrics.users.clients / metrics.users.total) * 100).toFixed(0)}% del total`,
      icon: Users,
      color: 'orange',
    },
    {
      title: 'Rutinas Activas',
      value: metrics.routines.active,
      change: `${metrics.routines.total} total`,
      icon: Dumbbell,
      color: 'indigo',
    },
    {
      title: 'Ejercicios',
      value: metrics.exercises.total,
      change: 'Disponibles en catálogo',
      icon: Dumbbell,
      color: 'pink',
    },
    {
      title: 'Alimentos',
      value: metrics.foods.total,
      change: 'En base de datos',
      icon: Apple,
      color: 'green',
    },
    {
      title: 'Calorías Quemadas',
      value: parseInt(metrics.activity.totalCaloriesBurned).toLocaleString(),
      change: `Promedio: ${metrics.activity.averageCaloriesBurnedPerDay} kcal/día`,
      icon: Activity,
      color: 'red',
    },
  ];

  // Datos para gráfico de distribución de roles
  const roleData = [
    { name: 'Clientes', value: metrics.users.clients, color: '#f97316' },
    { name: 'Coaches', value: metrics.users.coaches, color: '#a855f7' },
    { name: 'Admins', value: metrics.users.admins, color: '#3b82f6' },
  ];

  // Formatear fechas para los gráficos
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (period === 'week') {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else if (period === 'month') {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    }
  };

  const userGrowthData = metrics.charts.userGrowth.map(item => ({
    date: formatDate(item.date),
    usuarios: item.totalUsers,
  }));

  const activityData = metrics.charts.activity.map(item => ({
    date: formatDate(item.date),
    ejercicios: item.exercises,
    comidas: item.meals,
    caloriasQuemadas: Math.round(item.caloriesBurned),
    caloriasConsumidas: Math.round(item.caloriesConsumed),
  }));

  return (
    <div className="space-y-6">
      {/* Header con selector de período */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Métricas del Sistema
        </h2>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
            indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
            pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
            red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
          };

          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gráfico de crecimiento de usuarios */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Crecimiento de Usuarios
          </h3>
          <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-600" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              className="dark:bg-gray-800 dark:border-gray-700"
            />
            <Line 
              type="monotone" 
              dataKey="usuarios" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de actividad diaria */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad Diaria
          </h3>
          <Activity className="w-5 h-5 text-gray-400 dark:text-gray-600" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280"
              className="dark:stroke-gray-400"
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              className="dark:bg-gray-800 dark:border-gray-700"
            />
            <Legend />
            <Bar dataKey="ejercicios" fill="#3b82f6" name="Ejercicios" />
            <Bar dataKey="comidas" fill="#10b981" name="Comidas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de calorías */}
      {activityData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calorías Quemadas vs Consumidas
            </h3>
            <UtensilsCrossed className="w-5 h-5 text-gray-400 dark:text-gray-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="caloriasQuemadas" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Quemadas"
                dot={{ fill: '#ef4444', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="caloriasConsumidas" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Consumidas"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribución de roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución de Roles
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estadísticas de Actividad
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Días con Ejercicios</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {metrics.activity.uniqueExerciseDays}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((metrics.activity.uniqueExerciseDays / 30) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Días con Comidas</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {metrics.activity.uniqueMealDays}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((metrics.activity.uniqueMealDays / 30) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Total Calorías Quemadas</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {parseInt(metrics.activity.totalCaloriesBurned).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Promedio: {metrics.activity.averageCaloriesBurnedPerDay} kcal/día
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Total Calorías Consumidas</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {parseInt(metrics.activity.totalCaloriesConsumed).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Promedio: {metrics.activity.averageCaloriesConsumedPerDay} kcal/día
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;
