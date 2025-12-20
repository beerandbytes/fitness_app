import React from 'react';
import {
  Shield,
  Activity,
  Dumbbell,
  Target,
  TrendingDown,
  TrendingUp,
  Scale,
  Utensils,
  LayoutDashboard,
  CheckCircle,
  AlertTriangle,
  Info,
  Trophy,
  Clock,
  Bell,
  Edit2,
  Trash2,
  Lightbulb,
  Users
} from 'lucide-react';

/**
 * Sistema de iconos usando Lucide React
 * Mantiene consistencia visual y uso profesional
 */

const Icon = ({ name, className = "w-5 h-5", ...props }) => {
  const icons = {
    // Ejercicios y fitness - Grupos musculares y generales
    chest: <Shield className={className} {...props} />, // Metaphor for chest/protection
    leg: <Activity className={className} {...props} />, // Generic activity for now, or Footprints if available
    back: <Activity className={className} {...props} />, // Lucide doesn't have specific muscle groups, using generic
    arm: <Dumbbell className={className} {...props} />,
    shoulder: <Dumbbell className={className} {...props} />,

    // Ejercicios generales
    dumbbell: <Dumbbell className={className} {...props} />,
    muscle: <Dumbbell className={className} {...props} />,
    workout: <Dumbbell className={className} {...props} />,

    // Objetivos y metas
    target: <Target className={className} {...props} />,

    // CORRECCIÓN SOLICITADA: Perder peso = Flecha abajo, Ganar peso = Flecha arriba
    weightLoss: <TrendingDown className={className} {...props} />,
    weightGain: <TrendingUp className={className} {...props} />,

    scale: <Scale className={className} {...props} />,
    muscleGain: <Dumbbell className={className} {...props} />, // Gain muscle -> Dumbbell

    // Nutrición
    food: <Utensils className={className} {...props} />,
    nutrition: <Utensils className={className} {...props} />,

    // Estadísticas y gráficos
    chart: <TrendingUp className={className} {...props} />,
    dashboard: <LayoutDashboard className={className} {...props} />,
    trendUp: <TrendingUp className={className} {...props} />,
    progress: <TrendingUp className={className} {...props} />,

    // Notificaciones y estados
    success: <CheckCircle className={className} {...props} />,
    warning: <AlertTriangle className={className} {...props} />,
    info: <Info className={className} {...props} />,
    achievement: <Trophy className={className} {...props} />,
    reminder: <Clock className={className} {...props} />,
    bell: <Bell className={className} {...props} />,

    // Acciones
    edit: <Edit2 className={className} {...props} />,
    delete: <Trash2 className={className} {...props} />,
    recommendation: <Lightbulb className={className} {...props} />,
    community: <Users className={className} {...props} />,
  };

  return icons[name] || null;
};

export default Icon;
