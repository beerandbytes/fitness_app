import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import api from '../services/api';
import logger from '../utils/logger';
import { useDebounce } from '../hooks/useDebounce';

/**
 * Componente de búsqueda global accesible con Cmd/Ctrl+K
 */
const GlobalSearch = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    routines: [],
    exercises: [],
    foods: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Atajo de teclado: Cmd/Ctrl+K
  useKeyboardShortcuts({
    'ctrl+k': () => onOpenChange(true),
    'cmd+k': () => onOpenChange(true),
  });

  // Focus en input cuando se abre
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Buscar cuando cambia el query
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ routines: [], exercises: [], foods: [] });
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        // Buscar en paralelo
        const [routinesRes, exercisesRes, foodsRes] = await Promise.allSettled([
          api.get(`/routines?search=${encodeURIComponent(debouncedQuery)}`).catch(() => ({ data: { routines: [] } })),
          api.get(`/exercises/search?name=${encodeURIComponent(debouncedQuery)}`).catch(() => ({ data: { exercises: [] } })),
          api.get(`/foods/search?name=${encodeURIComponent(debouncedQuery)}`).catch(() => ({ data: { foods: [] } })),
        ]);

        setResults({
          routines: routinesRes.status === 'fulfilled' ? routinesRes.value.data.routines || [] : [],
          exercises: exercisesRes.status === 'fulfilled' ? exercisesRes.value.data.exercises || [] : [],
          foods: foodsRes.status === 'fulfilled' ? foodsRes.value.data.foods || [] : [],
        });
      } catch (error) {
        logger.error('Error en búsqueda global:', error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleSelect = (type, item) => {
    onOpenChange(false);
    setQuery('');
    
    switch (type) {
      case 'routine':
        navigate(`/routines/${item.routine_id}`);
        break;
      case 'exercise':
        navigate(`/routines?exercise=${item.exercise_id}`);
        break;
      case 'food':
        navigate(`/diet?food=${item.food_id}`);
        break;
      default:
        break;
    }
  };

  const allResults = [
    ...results.routines.map(r => ({ ...r, type: 'routine' })),
    ...results.exercises.map(e => ({ ...e, type: 'exercise' })),
    ...results.foods.map(f => ({ ...f, type: 'food' })),
  ];

  const filteredResults = selectedCategory === 'all' 
    ? allResults 
    : allResults.filter(r => r.type === selectedCategory);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed top-[20%] left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-0 max-w-2xl w-full mx-4 z-50 focus:outline-none"
          onEscapeKeyDown={() => {
            setQuery('');
            onOpenChange(false);
          }}
        >
          {/* Input de búsqueda */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar rutinas, ejercicios, alimentos..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
                autoFocus
              />
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd>
                <span>para cerrar</span>
              </div>
            </div>
          </div>

          {/* Filtros de categoría */}
          {query.length >= 2 && (
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex gap-2">
              {[
                { value: 'all', label: 'Todo' },
                { value: 'routine', label: 'Rutinas' },
                { value: 'exercise', label: 'Ejercicios' },
                { value: 'food', label: 'Alimentos' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Resultados */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : query.length < 2 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Búsqueda Global</p>
                <p className="text-sm">Escribe para buscar rutinas, ejercicios y alimentos</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">K</kbd>
                  <span>para abrir</span>
                </div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No se encontraron resultados para "{query}"</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredResults.slice(0, 20).map((item, index) => (
                  <button
                    key={`${item.type}-${item.routine_id || item.exercise_id || item.food_id || index}`}
                    onClick={() => handleSelect(item.type, item)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      {item.type === 'routine' && '📋'}
                      {item.type === 'exercise' && '💪'}
                      {item.type === 'food' && '🍎'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {item.name || item.routine_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {item.type === 'routine' && 'Rutina'}
                        {item.type === 'exercise' && 'Ejercicio'}
                        {item.type === 'food' && 'Alimento'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Enter →
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default GlobalSearch;

