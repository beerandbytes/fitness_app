import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { announceToScreenReader } from '../utils/accessibility';
import logger from '../utils/logger';

/**
 * Temporizador integrado para entrenamientos
 * Permite temporizadores por ejercicio y descanso
 */
const WorkoutTimer = ({ 
  exerciseDuration = 60, // Duración del ejercicio en segundos
  restDuration = 30, // Duración del descanso en segundos
  onComplete,
  onRestComplete,
  autoStart = false,
  showFullScreen = false,
  onFullScreenChange,
}) => {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isResting, setIsResting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(exerciseDuration);
  const [isFullScreen, setIsFullScreen] = useState(showFullScreen);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Cargar sonido de notificación
  useEffect(() => {
    // Crear audio context para sonidos
    try {
      audioRef.current = new Audio();
      // Usar un beep simple generado programáticamente
      // En producción, usar archivos de audio reales
    } catch (e) {
      logger.warn('Audio no disponible:', e);
    }
  }, []);

  // Reproducir sonido
  const playSound = () => {
    if (!soundEnabled || !audioRef.current) return;
    
    try {
      // Generar beep usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frecuencia del beep
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      logger.warn('Error al reproducir sonido:', e);
    }
  };

  // Vibrar (si está disponible)
  const vibrate = (pattern = [100]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Efecto del temporizador
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            
            if (isResting) {
              // Descanso completado
              playSound();
              vibrate([100, 50, 100]);
              announceToScreenReader('Descanso completado. Comienza el ejercicio.');
              if (onRestComplete) {
                onRestComplete();
              }
              setIsResting(false);
              setTimeRemaining(exerciseDuration);
            } else {
              // Ejercicio completado
              playSound();
              vibrate([200, 100, 200]);
              announceToScreenReader('Ejercicio completado. Inicia el descanso.');
              if (onComplete) {
                onComplete();
              }
              setIsResting(true);
              setTimeRemaining(restDuration);
            }
            return 0;
          }
          
          // Anunciar cada 10 segundos o en los últimos 5 segundos
          if (prev % 10 === 0 || prev <= 5) {
            announceToScreenReader(`${prev} segundos restantes`);
          }
          
          // Sonido y vibración en últimos 3 segundos
          if (prev <= 3) {
            playSound();
            vibrate([50]);
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, isResting, exerciseDuration, restDuration, onComplete, onRestComplete]);
  // playSound está definido dentro del componente y no cambia, no necesita estar en dependencias

  const handleStart = () => {
    setIsRunning(true);
    announceToScreenReader('Temporizador iniciado');
  };

  const handlePause = () => {
    setIsRunning(false);
    announceToScreenReader('Temporizador pausado');
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsResting(false);
    setTimeRemaining(exerciseDuration);
    announceToScreenReader('Temporizador reiniciado');
  };

  const handleFullScreen = () => {
    const newState = !isFullScreen;
    setIsFullScreen(newState);
    
    if (newState) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    if (onFullScreenChange) {
      onFullScreenChange(newState);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = isResting
    ? (timeRemaining / restDuration) * 100
    : (timeRemaining / exerciseDuration) * 100;

  const componentClasses = isFullScreen
    ? 'fixed inset-0 z-[10000] bg-black flex items-center justify-center'
    : 'bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg';

  return (
    <div className={componentClasses}>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isResting ? 'Descanso' : 'Ejercicio'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isResting ? 'Tómate un descanso' : 'Mantén el ritmo'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={handleFullScreen}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullScreen ? (
                <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          <div className="aspect-square w-full max-w-xs mx-auto">
            {/* Circular Progress */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                className={`transition-all duration-1000 ${
                  isResting
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-green-500 dark:text-green-400'
                }`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-6xl font-bold ${
                    isResting
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                  role="timer"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {isResting ? 'Descanso' : 'Ejercicio'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Reiniciar temporizador"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          {isRunning ? (
            <button
              onClick={handlePause}
              className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
              aria-label="Pausar temporizador"
            >
              <Pause className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg"
              aria-label="Iniciar temporizador"
            >
              <Play className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isResting
                  ? 'bg-blue-500 dark:bg-blue-400'
                  : 'bg-green-500 dark:text-green-400'
              }`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;

