import React from 'react';
import { Trophy, Target, Flame, Star, Award, Zap } from 'lucide-react';

/**
 * Componente de Badge de Logro
 * Muestra un logro desbloqueado con animación
 */
const AchievementBadge = ({ achievement, size = 'md', showDescription = true }) => {
  const {
    name,
    description,
    icon_type = 'trophy',
    rarity = 'common', // common, rare, epic, legendary
    unlocked_at,
    progress = null,
    max_progress = null,
  } = achievement;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const rarityColors = {
    common: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700',
    rare: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    epic: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700',
    legendary: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
  };

  const iconMap = {
    trophy: Trophy,
    target: Target,
    flame: Flame,
    star: Star,
    award: Award,
    zap: Zap,
  };

  const Icon = iconMap[icon_type] || Trophy;
  const isUnlocked = !!unlocked_at;
  const progressPercent = progress && max_progress ? (progress / max_progress) * 100 : 0;

  return (
    <div
      className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
        isUnlocked
          ? `${rarityColors[rarity]} shadow-lg hover:scale-105`
          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-50'
      }`}
    >
      {/* Badge Icon */}
      <div className={`${sizeClasses[size]} flex items-center justify-center mb-2`}>
        <Icon className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'}`} />
      </div>

      {/* Badge Name */}
      <h4
        className={`font-semibold text-center mb-1 ${
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        }`}
      >
        {name}
      </h4>

      {/* Description */}
      {showDescription && description && (
        <p
          className={`text-center text-gray-600 dark:text-gray-400 ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          }`}
        >
          {description}
        </p>
      )}

      {/* Progress Bar (si no está desbloqueado) */}
      {!isUnlocked && progress !== null && max_progress !== null && (
        <div className="w-full mt-2">
          <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">
            {progress} / {max_progress}
          </p>
        </div>
      )}

      {/* Unlocked Badge */}
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Rarity Indicator */}
      {isUnlocked && rarity !== 'common' && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              rarity === 'rare'
                ? 'bg-blue-500 text-white'
                : rarity === 'epic'
                ? 'bg-purple-500 text-white'
                : 'bg-yellow-500 text-white'
            }`}
          >
            {rarity.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;

