import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/app/layout/AppLayout';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import AchievementBadge from '../components/AchievementBadge';
import api from '../services/api';
import logger from '../utils/logger';
import { AchievementsPageSkeleton } from '../components/AchievementsPageSkeleton';
import EmptyState from '../components/EmptyState';
import { Trophy, Filter } from 'lucide-react';

/**
 * Página de Logros y Badges
 * Muestra todos los logros disponibles y el progreso del usuario
 */
const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked, rare, epic, legendary

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      // Nota: Estos endpoints necesitan ser implementados en el backend
      const [achievementsRes, userAchievementsRes] = await Promise.all([
        api.get('/achievements').catch(() => ({ data: { achievements: [] } })),
        api.get('/achievements/user').catch(() => ({ data: { userAchievements: [] } })),
      ]);

      const allAchievements = achievementsRes.data.achievements || [];
      const userAchievementsData = userAchievementsRes.data.userAchievements || [];

      // Combinar datos
      const achievementsWithProgress = allAchievements.map((achievement) => {
        const userAchievement = userAchievementsData.find(
          (ua) => ua.achievement_id === achievement.achievement_id
        );
        return {
          ...achievement,
          unlocked_at: userAchievement?.unlocked_at || null,
          progress: userAchievement?.progress || 0,
          max_progress: achievement.required_value || 0,
        };
      });

      setAchievements(achievementsWithProgress);
    } catch (error) {
      logger.error('Error al cargar logros:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter((achievement) => {
    switch (filter) {
      case 'unlocked':
        return !!achievement.unlocked_at;
      case 'locked':
        return !achievement.unlocked_at;
      case 'rare':
        return achievement.rarity === 'rare';
      case 'epic':
        return achievement.rarity === 'epic';
      case 'legendary':
        return achievement.rarity === 'legendary';
      default:
        return true;
    }
  });

  const unlockedCount = achievements.filter((a) => a.unlocked_at).length;
  const totalCount = achievements.length;
  const completionPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <AppLayout>
        <PageContainer>
          <AchievementsPageSkeleton />
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Logros y Badges
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Desbloquea logros completando objetivos y alcanzando hitos
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-3xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 dark:text-blue-200 text-sm mb-1">Progreso Total</p>
              <p className="text-3xl font-bold">
                {unlockedCount} / {totalCount}
              </p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.round(completionPercent)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          {['all', 'unlocked', 'locked', 'rare', 'epic', 'legendary'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all'
                ? 'Todos'
                : f === 'unlocked'
                ? 'Desbloqueados'
                : f === 'locked'
                ? 'Bloqueados'
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-16 h-16 text-gray-400" />}
            title="No hay logros disponibles"
            message={`No se encontraron logros con el filtro "${filter}"`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.achievement_id}
                achievement={achievement}
                size="md"
                showDescription={true}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
};

export default AchievementsPage;
