import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

/**
 * Componente de filtros y búsqueda para el dashboard del coach
 * Permite buscar clientes y filtrar por múltiples criterios
 */
const ClientFilters = ({ 
  onFilterChange,
  onSearchChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'active', 'inactive'
    completionRate: 'all', // 'all', 'high', 'medium', 'low'
    lastActivity: 'all', // 'all', 'today', 'week', 'month'
    sortBy: 'name', // 'name', 'weight', 'completion', 'activity'
    sortOrder: 'asc', // 'asc', 'desc'
  });
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange]);
  
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      status: 'all',
      completionRate: 'all',
      lastActivity: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setSearchTerm('');
  };
  
  const activeFiltersCount = Object.values(filters).filter(
    v => v !== 'all' && v !== 'name' && v !== 'asc'
  ).length + (searchTerm ? 1 : 0);
  
  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar clientes por email..."
          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Botón de filtros */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Filtros
          </span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      
      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          
          {/* Cumplimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cumplimiento
            </label>
            <select
              value={filters.completionRate}
              onChange={(e) => handleFilterChange('completionRate', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Todos</option>
              <option value="high">Alto (80%+)</option>
              <option value="medium">Medio (50-79%)</option>
              <option value="low">Bajo (&lt;50%)</option>
            </select>
          </div>
          
          {/* Última actividad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Última Actividad
            </label>
            <select
              value={filters.lastActivity}
              onChange={(e) => handleFilterChange('lastActivity', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Todos</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
          
          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ordenar por
            </label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="name">Nombre</option>
                <option value="weight">Peso</option>
                <option value="completion">Cumplimiento</option>
                <option value="activity">Actividad</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Ordenar ${filters.sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFilters;

