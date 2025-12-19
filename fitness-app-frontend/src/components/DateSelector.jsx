import React, { useState } from 'react';
import { format, subDays, addDays, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

/**
 * Componente para seleccionar fechas en el dashboard
 * Permite navegar entre días y comparar con días anteriores
 */
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
    const today = new Date();
    onDateChange(today);
    setShowCalendar(false);
  };

  const handleDateClick = (date) => {
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;
    onDateChange(date);
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

  // Generar días de la semana actual para el calendario
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2">
        <button
          onClick={handlePreviousDay}
          disabled={minDate && selectedDate <= minDate}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Día anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {getDateLabel(selectedDate)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {format(selectedDate, 'd/M/yyyy')}
            </div>
          </div>
        </button>
        
        <button
          onClick={handleNextDay}
          disabled={maxDate && selectedDate >= maxDate}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seleccionar Fecha
              </h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Días de la semana actual */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map((day) => {
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isTodayDate = isToday(day);
                const isDisabled = (minDate && day < minDate) || (maxDate && day > maxDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : isTodayDate
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
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

