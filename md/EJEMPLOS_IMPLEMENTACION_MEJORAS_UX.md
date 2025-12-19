# 💻 Ejemplos de Implementación - Mejoras UX

Este documento contiene ejemplos de código para implementar las mejoras UX priorizadas.

---

## 🎯 A1. Mejoras en Feedback Visual

### Componente EmptyState Reutilizable

```jsx
// fitness-app-frontend/src/components/EmptyState.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionPath,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionPath,
  illustration
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {illustration ? (
        <div className="mb-6 w-48 h-48 mx-auto">
          <img 
            src={illustration} 
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>
      ) : icon ? (
        <div className="mb-6 w-16 h-16 mx-auto text-gray-400 dark:text-gray-600">
          {icon}
        </div>
      ) : (
        <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {actionPath && (
          <Link
            to={actionPath}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
          >
            {actionLabel}
          </Link>
        )}
        
        {actionOnClick && (
          <button
            onClick={actionOnClick}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
          >
            {actionLabel}
          </button>
        )}
        
        {secondaryActionLabel && secondaryActionPath && (
          <Link
            to={secondaryActionPath}
            className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {secondaryActionLabel}
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
```

### Uso en Dashboard

```jsx
// Ejemplo de uso en Dashboard.jsx
import EmptyState from '../components/EmptyState';
import { PlusCircle, Utensils } from 'lucide-react';

// En el componente Dashboard:
{mealItems.length === 0 && (
  <EmptyState
    icon={<Utensils className="w-16 h-16" />}
    title="Aún no has registrado comidas hoy"
    description="Comienza registrando tu primera comida para llevar un seguimiento de tus calorías y macronutrientes."
    actionLabel="Añadir Comida"
    actionPath="/diet"
    secondaryActionLabel="Ver Tutorial"
    secondaryActionPath="/help/food-tracking"
  />
)}
```

---

## 🎯 A2. Guardar Progreso en Onboarding

### Hook useOnboardingProgress

```jsx
// fitness-app-frontend/src/hooks/useOnboardingProgress.js
import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'onboarding_progress';

export const useOnboardingProgress = () => {
  const [progress, setProgress] = useState(null);

  // Cargar progreso guardado al montar
  useEffect(() => {
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Error al cargar progreso de onboarding:', e);
      }
    }
  }, []);

  // Guardar progreso
  const saveProgress = (step, formData) => {
    const progressData = {
      step,
      formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progressData));
    setProgress(progressData);
  };

  // Limpiar progreso (cuando se completa)
  const clearProgress = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setProgress(null);
  };

  // Verificar si hay progreso guardado
  const hasSavedProgress = () => {
    return progress !== null;
  };

  return {
    progress,
    saveProgress,
    clearProgress,
    hasSavedProgress,
  };
};
```

### Modificación en WelcomePage.jsx

```jsx
// En WelcomePage.jsx - Agregar al inicio del componente
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';

const WelcomePage = () => {
  const { progress, saveProgress, clearProgress, hasSavedProgress } = useOnboardingProgress();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    height: '',
    initial_weight: '',
    target_weight: '',
    goal_type: 'weight_loss',
    daily_calorie_goal: '',
    activity_level: 'moderate',
  });

  // Restaurar progreso guardado al montar
  useEffect(() => {
    if (progress) {
      setCurrentStep(progress.step);
      setFormData(progress.formData);
      
      // Mostrar notificación de progreso restaurado
      toast.info('Hemos restaurado tu progreso anterior');
    }
  }, []);

  // Guardar progreso después de cada cambio
  useEffect(() => {
    if (currentStep > 1) {
      saveProgress(currentStep, formData);
    }
  }, [currentStep, formData]);

  // Al completar onboarding
  const handleFinish = async () => {
    clearProgress(); // Limpiar progreso guardado
    await loadUser();
    navigate('/dashboard', { replace: true });
  };

  // Agregar banner de progreso guardado
  {hasSavedProgress() && currentStep === 1 && (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Tienes un progreso guardado. ¿Deseas continuar donde lo dejaste?
        </p>
        <button
          onClick={() => {
            if (progress) {
              setCurrentStep(progress.step);
              setFormData(progress.formData);
            }
          }}
          className="ml-auto text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Continuar
        </button>
      </div>
    </div>
  )}
};
```

---

## 🎯 A3. Validación en Tiempo Real

### Componente Input con Validación

```jsx
// fitness-app-frontend/src/components/ValidatedInput.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ValidatedInput = ({
  label,
  type = 'text',
  value,
  onChange,
  onValidation,
  validator,
  errorMessage,
  successMessage,
  placeholder,
  required = false,
  ...props
}) => {
  const [isValid, setIsValid] = useState(null);
  const [isTouched, setIsTouched] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isTouched || !value) {
      setIsValid(null);
      setMessage('');
      return;
    }

    if (validator) {
      const result = validator(value);
      setIsValid(result.valid);
      setMessage(result.message || '');
      
      if (onValidation) {
        onValidation(result.valid, result.message);
      }
    }
  }, [value, validator, isTouched, onValidation]);

  const handleBlur = () => {
    setIsTouched(true);
  };

  const handleChange = (e) => {
    setIsTouched(true);
    onChange(e);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
            isValid === true
              ? 'border-green-500 focus:ring-green-500/20 focus:border-green-600'
              : isValid === false
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600'
              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400'
          }`}
          {...props}
        />
        
        {isTouched && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid === true ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : isValid === false ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
        )}
      </div>
      
      {isTouched && message && (
        <p
          className={`text-sm flex items-center gap-1 ${
            isValid === true
              ? 'text-green-600 dark:text-green-400'
              : isValid === false
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {isValid === false && <AlertCircle className="w-4 h-4" />}
          {message}
        </p>
      )}
      
      {isTouched && !message && isValid === true && successMessage && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;
```

### Validadores Reutilizables

```jsx
// fitness-app-frontend/src/utils/validators.js (extender existente)

export const emailValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'El email es requerido' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { valid: false, message: 'Por favor ingresa un email válido' };
  }
  
  return { valid: true, message: 'Email válido' };
};

export const passwordValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  
  if (value.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(value)) {
    return { valid: false, message: 'Debe incluir al menos una mayúscula' };
  }
  
  if (!/[a-z]/.test(value)) {
    return { valid: false, message: 'Debe incluir al menos una minúscula' };
  }
  
  if (!/[0-9]/.test(value)) {
    return { valid: false, message: 'Debe incluir al menos un número' };
  }
  
  if (!/[@$!%*?&]/.test(value)) {
    return { valid: false, message: 'Debe incluir al menos un carácter especial (@$!%*?&)' };
  }
  
  return { valid: true, message: 'Contraseña segura' };
};

export const ageValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'La edad es requerida' };
  }
  
  const age = parseInt(value);
  if (isNaN(age) || age < 1 || age > 120) {
    return { valid: false, message: 'Por favor ingresa una edad válida (1-120)' };
  }
  
  return { valid: true, message: '' };
};

export const heightValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'La altura es requerida' };
  }
  
  const height = parseFloat(value);
  if (isNaN(height) || height < 50 || height > 300) {
    return { valid: false, message: 'Por favor ingresa una altura válida (50-300 cm)' };
  }
  
  return { valid: true, message: '' };
};

export const weightValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'El peso es requerido' };
  }
  
  const weight = parseFloat(value);
  if (isNaN(weight) || weight < 20 || weight > 300) {
    return { valid: false, message: 'Por favor ingresa un peso válido (20-300 kg)' };
  }
  
  return { valid: true, message: '' };
};
```

### Uso en AuthForm.jsx

```jsx
// En AuthForm.jsx
import ValidatedInput from '../components/ValidatedInput';
import { emailValidator, passwordValidator } from '../utils/validators';

// Reemplazar los inputs normales:
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
  validator={passwordValidator}
  placeholder="••••••••"
  required
  successMessage="Contraseña segura"
/>
```

---

## 🎯 B1. Selector de Fecha en Dashboard

### Componente DateSelector

```jsx
// fitness-app-frontend/src/components/DateSelector.jsx
import React, { useState } from 'react';
import { format, subDays, addDays, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DateSelector = ({ selectedDate, onDateChange, minDate, maxDate }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    if (!minDate || newDate >= minDate) {
      onDateChange(newDate);
    }
  };
  
  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1);
    if (!maxDate || newDate <= maxDate) {
      onDateChange(newDate);
    }
  };
  
  const handleToday = () => {
    onDateChange(new Date());
    setShowCalendar(false);
  };
  
  const getDateLabel = (date) => {
    if (isToday(date)) {
      return 'Hoy';
    }
    if (isYesterday(date)) {
      return 'Ayer';
    }
    return format(date, 'EEEE, d MMMM', { locale: es });
  };
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2">
        <button
          onClick={handlePreviousDay}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Día anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {getDateLabel(selectedDate)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {format(selectedDate, 'd/M/yyyy')}
          </span>
        </button>
        
        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={maxDate && selectedDate >= maxDate}
          aria-label="Día siguiente"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      {showCalendar && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCalendar(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seleccionar Fecha
              </h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
              
              {/* Aquí iría el calendario completo - usar librería como react-datepicker o implementar manualmente */}
            </div>
            
            <button
              onClick={handleToday}
              className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
            >
              Ir a Hoy
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DateSelector;
```

### Uso en Dashboard.jsx

```jsx
// En Dashboard.jsx
import DateSelector from '../components/DateSelector';
import { useState } from 'react';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // Actualizar fetchDailyLog para usar selectedDate
  const fetchDailyLog = useCallback(async () => {
    try {
      const response = await api.get(`/logs/${formattedDate}`);
      setLog(response.data.log);
      setMealItems(response.data.mealItems || []);
    } catch (err) {
      logger.error('Error al cargar log diario:', err);
    }
  }, [formattedDate]);
  
  // En el JSX, agregar antes del header:
  <div className="mb-6">
    <DateSelector
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      maxDate={new Date()} // No permitir fechas futuras
    />
  </div>
  
  {/* Comparación con día anterior */}
  {!isToday(selectedDate) && (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
      <p className="text-sm text-blue-800 dark:text-blue-300">
        Comparando con {format(subDays(selectedDate, 1), 'd MMMM', { locale: es })}
      </p>
    </div>
  )}
};
```

---

## 🎯 B2. Búsqueda y Filtros Avanzados Coach

### Componente ClientFilters

```jsx
// fitness-app-frontend/src/components/ClientFilters.jsx
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const ClientFilters = ({ 
  clients, 
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
  
  React.useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange]);
  
  React.useEffect(() => {
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
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
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
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
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
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
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
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="name">Nombre</option>
                <option value="weight">Peso</option>
                <option value="completion">Cumplimiento</option>
                <option value="activity">Actividad</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
```

### Uso en CoachDashboard.jsx

```jsx
// En CoachDashboard.jsx
import ClientFilters from '../components/ClientFilters';

const CoachDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(null);
  
  // Aplicar filtros y búsqueda
  const filteredClients = React.useMemo(() => {
    let result = [...clients];
    
    // Búsqueda
    if (searchTerm) {
      result = result.filter(client =>
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtros
    if (filters) {
      if (filters.status === 'active') {
        result = result.filter(c => !c.needsAttention);
      } else if (filters.status === 'inactive') {
        result = result.filter(c => c.needsAttention);
      }
      
      if (filters.completionRate === 'high') {
        result = result.filter(c => c.completionRate >= 80);
      } else if (filters.completionRate === 'medium') {
        result = result.filter(c => c.completionRate >= 50 && c.completionRate < 80);
      } else if (filters.completionRate === 'low') {
        result = result.filter(c => c.completionRate < 50);
      }
      
      // Ordenamiento
      result.sort((a, b) => {
        let aVal, bVal;
        switch (filters.sortBy) {
          case 'name':
            aVal = a.email;
            bVal = b.email;
            break;
          case 'weight':
            aVal = a.currentWeight || 0;
            bVal = b.currentWeight || 0;
            break;
          case 'completion':
            aVal = a.completionRate;
            bVal = b.completionRate;
            break;
          case 'activity':
            aVal = a.daysSinceActivity;
            bVal = b.daysSinceActivity;
            break;
          default:
            return 0;
        }
        
        if (filters.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    return result;
  }, [clients, searchTerm, filters]);
  
  return (
    <AppLayout>
      <PageContainer>
        {/* ... header ... */}
        
        {/* Filtros */}
        <div className="mb-6">
          <ClientFilters
            clients={clients}
            onSearchChange={setSearchTerm}
            onFilterChange={setFilters}
          />
        </div>
        
        {/* Usar filteredClients en lugar de clients */}
        {filteredClients.map(client => (
          // ...
        ))}
      </PageContainer>
    </AppLayout>
  );
};
```

---

## 📝 Notas de Implementación

1. **Testing**: Todos los componentes deben tener tests unitarios
2. **Accesibilidad**: Asegurar que todos los componentes sean accesibles (ARIA labels, navegación por teclado)
3. **Performance**: Usar React.memo y useMemo donde sea apropiado
4. **Responsive**: Todos los componentes deben funcionar en móvil, tablet y desktop
5. **Dark Mode**: Asegurar que todos los componentes soporten dark mode

---

**Última actualización**: [Fecha]

