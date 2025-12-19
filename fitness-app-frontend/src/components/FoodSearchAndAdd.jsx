import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import VirtualizedList from './VirtualizedList';
import useToastStore from '../stores/useToastStore';
import { useDebounce } from '../hooks/useDebounce';
import { useRateLimit } from '../hooks/useRateLimit';
import logger from '../utils/logger';

const MealType = {
    DESAYUNO: 'Desayuno',
    ALMUERZO: 'Almuerzo',
    CENA: 'Cena',
    SNACK: 'Snack',
};

// Alimentos comunes para sugerencias rápidas
const COMMON_FOODS_SUGGESTIONS = [
    // Proteínas - Carnes
    { name: 'Pollo (pechuga sin piel)', calories_base: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
    { name: 'Ternera (lomo)', calories_base: 250, protein_g: 26, carbs_g: 0, fat_g: 17 },
    { name: 'Cerdo (lomo)', calories_base: 242, protein_g: 27, carbs_g: 0, fat_g: 14 },
    { name: 'Pavo (pechuga)', calories_base: 135, protein_g: 30, carbs_g: 0, fat_g: 1 },
    
    // Proteínas - Pescados y mariscos
    { name: 'Salmón', calories_base: 208, protein_g: 20, carbs_g: 0, fat_g: 13 },
    { name: 'Atún (fresco)', calories_base: 184, protein_g: 30, carbs_g: 0, fat_g: 6 },
    { name: 'Atún en lata (agua)', calories_base: 116, protein_g: 26, carbs_g: 0, fat_g: 1 },
    { name: 'Bacalao', calories_base: 82, protein_g: 18, carbs_g: 0, fat_g: 0.7 },
    { name: 'Merluza', calories_base: 71, protein_g: 16, carbs_g: 0, fat_g: 0.6 },
    
    // Proteínas - Huevos y lácteos
    { name: 'Huevos (enteros)', calories_base: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11 },
    { name: 'Huevos (claras)', calories_base: 52, protein_g: 11, carbs_g: 0.7, fat_g: 0.2 },
    { name: 'Yogur griego natural', calories_base: 59, protein_g: 10, carbs_g: 3.6, fat_g: 0.4 },
    { name: 'Queso cottage', calories_base: 98, protein_g: 11, carbs_g: 3.4, fat_g: 4.3 },
    { name: 'Queso mozzarella', calories_base: 300, protein_g: 22, carbs_g: 2.2, fat_g: 22 },
    { name: 'Leche entera', calories_base: 61, protein_g: 3.3, carbs_g: 4.8, fat_g: 3.3 },
    { name: 'Leche desnatada', calories_base: 34, protein_g: 3.4, carbs_g: 5, fat_g: 0.1 },
    
    // Carbohidratos - Cereales y granos
    { name: 'Arroz blanco (cocido)', calories_base: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3 },
    { name: 'Arroz integral (cocido)', calories_base: 111, protein_g: 2.6, carbs_g: 23, fat_g: 0.9 },
    { name: 'Pasta (cocida)', calories_base: 131, protein_g: 5, carbs_g: 25, fat_g: 1.1 },
    { name: 'Pasta integral (cocida)', calories_base: 124, protein_g: 5, carbs_g: 25, fat_g: 1.1 },
    { name: 'Avena (cocida)', calories_base: 68, protein_g: 2.4, carbs_g: 12, fat_g: 1.4 },
    { name: 'Quinoa (cocida)', calories_base: 120, protein_g: 4.4, carbs_g: 22, fat_g: 1.9 },
    { name: 'Pan integral', calories_base: 247, protein_g: 13, carbs_g: 41, fat_g: 4.2 },
    { name: 'Pan blanco', calories_base: 265, protein_g: 9, carbs_g: 49, fat_g: 3.2 },
    
    // Carbohidratos - Tubérculos
    { name: 'Patata (cocida)', calories_base: 87, protein_g: 2, carbs_g: 20, fat_g: 0.1 },
    { name: 'Batata (cocida)', calories_base: 86, protein_g: 1.6, carbs_g: 20, fat_g: 0.1 },
    
    // Verduras
    { name: 'Brócoli (cocido)', calories_base: 35, protein_g: 2.8, carbs_g: 7, fat_g: 0.4 },
    { name: 'Espinacas (cocidas)', calories_base: 23, protein_g: 3, carbs_g: 3.8, fat_g: 0.3 },
    { name: 'Tomate', calories_base: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2 },
    { name: 'Lechuga', calories_base: 15, protein_g: 1.4, carbs_g: 2.9, fat_g: 0.2 },
    { name: 'Zanahoria', calories_base: 41, protein_g: 0.9, carbs_g: 10, fat_g: 0.2 },
    { name: 'Pepino', calories_base: 16, protein_g: 0.7, carbs_g: 4, fat_g: 0.1 },
    { name: 'Cebolla', calories_base: 40, protein_g: 1.1, carbs_g: 9.3, fat_g: 0.1 },
    { name: 'Pimiento rojo', calories_base: 31, protein_g: 1, carbs_g: 7, fat_g: 0.3 },
    { name: 'Calabacín', calories_base: 17, protein_g: 1.2, carbs_g: 3.1, fat_g: 0.3 },
    { name: 'Berenjena', calories_base: 25, protein_g: 1, carbs_g: 6, fat_g: 0.2 },
    
    // Frutas
    { name: 'Plátano', calories_base: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3 },
    { name: 'Manzana', calories_base: 52, protein_g: 0.3, carbs_g: 14, fat_g: 0.2 },
    { name: 'Naranja', calories_base: 47, protein_g: 0.9, carbs_g: 12, fat_g: 0.1 },
    { name: 'Fresa', calories_base: 32, protein_g: 0.7, carbs_g: 7.7, fat_g: 0.3 },
    { name: 'Uvas', calories_base: 69, protein_g: 0.7, carbs_g: 18, fat_g: 0.2 },
    { name: 'Pera', calories_base: 57, protein_g: 0.4, carbs_g: 15, fat_g: 0.1 },
    { name: 'Melón', calories_base: 34, protein_g: 0.8, carbs_g: 8, fat_g: 0.2 },
    { name: 'Sandía', calories_base: 30, protein_g: 0.6, carbs_g: 8, fat_g: 0.2 },
    
    // Legumbres
    { name: 'Lentejas (cocidas)', calories_base: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4 },
    { name: 'Garbanzos (cocidos)', calories_base: 164, protein_g: 8.9, carbs_g: 27, fat_g: 2.6 },
    { name: 'Judías negras (cocidas)', calories_base: 132, protein_g: 8.9, carbs_g: 24, fat_g: 0.5 },
    { name: 'Judías blancas (cocidas)', calories_base: 127, protein_g: 8.2, carbs_g: 23, fat_g: 0.5 },
    
    // Frutos secos y semillas
    { name: 'Aguacate', calories_base: 160, protein_g: 2, carbs_g: 9, fat_g: 15 },
    { name: 'Almendras', calories_base: 579, protein_g: 21, carbs_g: 22, fat_g: 50 },
    { name: 'Nueces', calories_base: 654, protein_g: 15, carbs_g: 14, fat_g: 65 },
    { name: 'Avellanas', calories_base: 628, protein_g: 15, carbs_g: 17, fat_g: 61 },
    { name: 'Cacahuetes', calories_base: 567, protein_g: 26, carbs_g: 16, fat_g: 49 },
    
    // Aceites y grasas
    { name: 'Aceite de oliva', calories_base: 884, protein_g: 0, carbs_g: 0, fat_g: 100 },
    { name: 'Mantequilla de cacahuete', calories_base: 588, protein_g: 25, carbs_g: 20, fat_g: 50 },
    
    // Otros
    { name: 'Miel', calories_base: 304, protein_g: 0.3, carbs_g: 82, fat_g: 0 },
    { name: 'Chocolate negro (70%)', calories_base: 598, protein_g: 7.8, carbs_g: 46, fat_g: 43 },
    { name: 'Aceitunas verdes', calories_base: 145, protein_g: 1, carbs_g: 6, fat_g: 15 },
];

const FoodSearchAndAdd = React.memo(({ log, onLogUpdated, date }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState(100);
    const [mealType, setMealType] = useState(MealType.DESAYUNO);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const dropdownRef = useRef(null);
    const logId = log?.log_id;
    const toast = useToastStore();
    
    // Función de búsqueda con useCallback
    const handleSearch = useCallback(async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }
        
        setSearchLoading(true);
        try {
            // Aumentar límite a 100 resultados para mostrar más opciones
            const response = await api.get(`/foods/search?name=${encodeURIComponent(query)}&limit=100`);
            
            // Verificar que la respuesta tenga el formato correcto
            if (!response || !response.data) {
                logger.warn('Respuesta de búsqueda inválida:', response);
                setSearchResults([]);
                return;
            }
            
            const foods = response.data.foods || [];
            
            // Log para debugging
            if (foods.length === 0) {
                logger.info(`Búsqueda "${query}" no devolvió resultados`);
            } else {
                logger.info(`Búsqueda "${query}" devolvió ${foods.length} resultados`);
            }
            
            // Usar directamente los resultados de la API, ya que el backend hace búsqueda case-insensitive
            setSearchResults(foods);
        } catch (error) {
            logger.error('Error en la búsqueda:', error);
            // Mostrar error más detallado en consola para debugging
            if (error.response) {
                logger.error('Error de respuesta:', error.response.status, error.response.data);
            } else if (error.request) {
                logger.error('Error de red:', error.request);
            } else {
                logger.error('Error:', error.message);
            }
            setSearchResults([]);
            // Mostrar mensaje al usuario si es un error crítico
            if (error.response?.status >= 500) {
                toast.error('Error del servidor al buscar alimentos. Por favor, intenta más tarde.');
            }
        } finally {
            setSearchLoading(false);
        }
    }, [toast]);
    
    // Debounce del query de búsqueda
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    // Rate limiting para búsquedas (máximo 10 por segundo)
    const rateLimitedSearch = useRateLimit(handleSearch, 10, 1000);

    // Mostrar sugerencias comunes cuando el input está vacío
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            if (!selectedFood && searchQuery.length === 0) {
                setSearchResults([]);
                setShowSuggestions(true);
            } else {
                setSearchResults([]);
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    }, [searchQuery, selectedFood]);

    // Manejar clics fuera del dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
                if (!selectedFood) {
                    setSearchResults([]);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedFood]);

    useEffect(() => {
        if (!selectedFood && debouncedSearchQuery.length >= 2) {
            rateLimitedSearch(debouncedSearchQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery, rateLimitedSearch]);

    // Función para seleccionar alimento desde sugerencia común o búsqueda
    const handleSelectFood = async (food) => {
        // Si el alimento tiene food_id, usarlo directamente
        if (food.food_id && typeof food.food_id === 'number') {
            setSelectedFood(food);
            setSearchQuery(food.name);
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        // Si es una sugerencia común sin food_id, intentar buscarlo o crearlo
        try {
            setSearchLoading(true);
            // Primero buscar si ya existe
            const searchResponse = await api.get(`/foods/search?name=${encodeURIComponent(food.name)}`);
            
            if (searchResponse.data.foods && searchResponse.data.foods.length > 0) {
                // Si existe, usar el de la base de datos
                const existingFood = searchResponse.data.foods[0];
                setSelectedFood(existingFood);
                setSearchQuery(existingFood.name);
            } else {
                // Si no existe, crear el alimento
                const createResponse = await api.post('/foods', {
                    name: food.name,
                    calories_base: food.calories_base,
                    protein_g: food.protein_g || 0,
                    carbs_g: food.carbs_g || 0,
                    fat_g: food.fat_g || 0,
                });
                
                const createdFood = createResponse.data?.food || food;
                setSelectedFood({
                    ...createdFood,
                    food_id: createdFood.food_id || Date.now()
                });
                setSearchQuery(createdFood.name);
            }
        } catch (error) {
            logger.error('Error al buscar/crear alimento:', error);
            // Si falla, usar la sugerencia directamente como fallback
            setSelectedFood({
                ...food,
                food_id: Date.now()
            });
            setSearchQuery(food.name);
        } finally {
            setSearchLoading(false);
            setSearchResults([]);
            setShowSuggestions(false);
        }
    };

    const calculateCalories = () => {
        if (!selectedFood || !quantity || isNaN(quantity) || parseFloat(quantity) <= 0) return 0;
        const baseCalories = parseFloat(selectedFood.calories_base);
        return (baseCalories / 100) * parseFloat(quantity);
    };

    const calculateMacros = () => {
        if (!selectedFood || !quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
            return { protein: 0, carbs: 0, fat: 0 };
        }
        const multiplier = parseFloat(quantity) / 100;
        return {
            protein: (parseFloat(selectedFood.protein_g || 0) * multiplier).toFixed(1),
            carbs: (parseFloat(selectedFood.carbs_g || 0) * multiplier).toFixed(1),
            fat: (parseFloat(selectedFood.fat_g || 0) * multiplier).toFixed(1),
        };
    };

    const handleLogMeal = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!selectedFood) {
            toast.error('Por favor, selecciona un alimento.');
            setLoading(false);
            return;
        }

        try {
            // Si no hay log, crear uno automáticamente
            let currentLogId = logId;
            if (!currentLogId && date) {
                try {
                    // Crear el log con peso 0 (se puede actualizar después)
                    const createLogResponse = await api.post('/logs', {
                        date: date,
                        weight: 0
                    });
                    currentLogId = createLogResponse.data.log.log_id;
                    // Recargar el log completo con mealItems vacíos para mantener consistencia
                    // Esto se actualizará después cuando añadamos la comida
                } catch (error) {
                    logger.error('Error al crear log:', error);
                    const errorMessage = error.response?.data?.error || 'Error al crear el registro del día. Por favor, intenta nuevamente.';
                    toast.error(errorMessage);
                    setLoading(false);
                    return;
                }
            }

            if (!currentLogId) {
                toast.error('No se pudo crear el registro del día. Por favor, intenta nuevamente.');
                setLoading(false);
                return;
            }

            const consumed_calories = calculateCalories().toFixed(2);
            
            // Asegurar que tenemos un food_id válido
            let foodId = selectedFood.food_id;
            
            // Si no tenemos food_id válido, buscar o crear el alimento
            if (!foodId || typeof foodId === 'string' || isNaN(foodId)) {
                try {
                    // Buscar primero
                    const searchResponse = await api.get(`/foods/search?name=${encodeURIComponent(selectedFood.name)}`);
                    if (searchResponse.data.foods && searchResponse.data.foods.length > 0) {
                        foodId = searchResponse.data.foods[0].food_id;
                    } else {
                        // Crear si no existe
                        const createResponse = await api.post('/foods', {
                            name: selectedFood.name,
                            calories_base: selectedFood.calories_base,
                            protein_g: selectedFood.protein_g || 0,
                            carbs_g: selectedFood.carbs_g || 0,
                            fat_g: selectedFood.fat_g || 0,
                        });
                        foodId = createResponse.data?.food?.food_id;
                    }
                } catch (error) {
                    logger.error('Error al obtener/crear food_id:', error);
                    toast.error('Error al registrar el alimento. Por favor, intenta nuevamente.');
                    setLoading(false);
                    return;
                }
            }
            
            const response = await api.post('/meal-items', {
                log_id: currentLogId,
                food_id: foodId,
                quantity_grams: parseFloat(quantity).toFixed(2),
                meal_type: mealType,
                consumed_calories: consumed_calories,
            });

            toast.success('Comida registrada correctamente');
            onLogUpdated(response.data.updatedLog);

            setSelectedFood(null);
            setSearchQuery('');
            setQuantity(100);
            setShowSuggestions(false);
            setSearchResults([]);

        } catch (error) {
            logger.error('Error al registrar comida:', error.response?.data);
            toast.error(error.response?.data?.error || 'Error al registrar la comida. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };
    
    // Ya no bloqueamos si no hay log, permitimos crear uno automáticamente

    const macros = calculateMacros();

    return (
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-8 shadow-sm hover:shadow-lg hover:border-gray-300/50 dark:hover:border-gray-700/50 transition-all duration-500">
            <h2 className="text-2xl font-light tracking-tight text-gray-900 dark:text-white mb-6">Añadir Comida</h2>
            
            {/* Búsqueda */}
            <div className="mb-6" ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buscar alimento
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar alimento... (ej: pollo, arroz, ternera)"
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all pr-20"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (selectedFood) {
                                setSelectedFood(null);
                            }
                        }}
                        onFocus={() => {
                            if (!selectedFood && searchQuery.length < 2) {
                                setShowSuggestions(true);
                            }
                        }}
                        data-food-add
                    />
                    {searchLoading && (
                        <div className="absolute right-16 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                                setSelectedFood(null);
                                setShowSuggestions(true);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-400"
                            aria-label="Limpiar búsqueda"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Sugerencias comunes */}
                {showSuggestions && !selectedFood && searchQuery.length < 2 && (
                    <div ref={dropdownRef} className="mt-2 backdrop-blur-xl bg-white/80 dark:bg-black/80 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
                        <div className="px-4 py-2 backdrop-blur-sm bg-gray-100/60 dark:bg-gray-800/60 border-b border-gray-200/50 dark:border-gray-800/50">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Alimentos comunes</span>
                        </div>
                        <VirtualizedList
                            items={COMMON_FOODS_SUGGESTIONS}
                            itemHeight={70}
                            className="max-h-96"
                            renderItem={(suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelectFood(suggestion)}
                                    className="w-full px-4 py-3.5 text-left hover:backdrop-blur-md hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-200 border-b border-gray-200/50 dark:border-gray-800/50 last:border-b-0"
                                >
                                    <div className="font-medium text-gray-900 dark:text-white">{suggestion.name}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {suggestion.calories_base} kcal / 100g
                                        {suggestion.protein_g > 0 && (
                                            <span className="ml-2">• P: {suggestion.protein_g}g • C: {suggestion.carbs_g}g • G: {suggestion.fat_g}g</span>
                                        )}
                                    </div>
                                </button>
                            )}
                        />
                    </div>
                )}

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && searchQuery.length >= 2 && !selectedFood && (
                    <div ref={dropdownRef} className="mt-2 backdrop-blur-xl bg-white/80 dark:bg-black/80 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
                        <div className="px-4 py-2 backdrop-blur-sm bg-gray-100/60 dark:bg-gray-800/60 border-b border-gray-200/50 dark:border-gray-800/50">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                            </span>
                        </div>
                        <VirtualizedList
                            items={searchResults}
                            itemHeight={70}
                            className="max-h-96"
                            renderItem={(food) => (
                                <button
                                    key={food.food_id}
                                    type="button"
                                    onClick={() => handleSelectFood(food)}
                                    className="w-full px-4 py-3.5 text-left hover:backdrop-blur-md hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-200 border-b border-gray-200/50 dark:border-gray-800/50 last:border-b-0"
                                >
                                    <div className="font-medium text-gray-900 dark:text-white">{food.name}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {food.calories_base} kcal / 100g
                                        {(food.protein_g || food.carbs_g || food.fat_g) && (
                                            <span className="ml-2">• P: {food.protein_g || 0}g • C: {food.carbs_g || 0}g • G: {food.fat_g || 0}g</span>
                                        )}
                                    </div>
                                </button>
                            )}
                        />
                    </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && !selectedFood && !showSuggestions && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="font-medium mb-1">No se encontraron alimentos</div>
                        <div className="text-xs">
                            Intenta con otro término de búsqueda o selecciona uno de los alimentos comunes arriba.
                        </div>
                    </div>
                )}
            </div>

            {/* Formulario de registro */}
            {selectedFood && (
                <form onSubmit={handleLogMeal} className="space-y-5">
                    {/* Información del alimento seleccionado */}
                    <div className="backdrop-blur-md bg-gray-100/60 dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
                        <div className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{selectedFood.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedFood.calories_base} kcal por 100g
                            {selectedFood.protein_g > 0 && (
                                <span className="ml-2">• Proteína: {selectedFood.protein_g}g • Carbos: {selectedFood.carbs_g || 0}g • Grasa: {selectedFood.fat_g || 0}g</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cantidad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cantidad (g)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="1"
                                placeholder="100"
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>

                        {/* Tipo de comida */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Momento
                            </label>
                            <select 
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                                value={mealType} 
                                onChange={(e) => setMealType(e.target.value)}
                                required
                            >
                                {Object.values(MealType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Calorías y macronutrientes calculados */}
                    <div className="backdrop-blur-md bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-5 transition-all duration-300">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Valores calculados</div>
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <span className="text-gray-700 dark:text-gray-300">Calorías totales</span>
                                <span className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
                                    {calculateCalories().toFixed(0)} <span className="text-lg">kcal</span>
                                </span>
                            </div>
                            {selectedFood.protein_g > 0 && (
                                <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                                    <div className="grid grid-cols-3 gap-4 flex-1">
                                        <div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Proteína</div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{macros.protein}g</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Carbohidratos</div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{macros.carbs}g</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Grasa</div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{macros.fat}g</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    <button 
                        type="submit" 
                        className="w-full py-3.5 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Registrando...
                            </>
                        ) : (
                            `Registrar ${selectedFood.name}`
                        )}
                    </button>
                </form>
            )}
        </div>
    );
});

FoodSearchAndAdd.displayName = 'FoodSearchAndAdd';

export default FoodSearchAndAdd;
