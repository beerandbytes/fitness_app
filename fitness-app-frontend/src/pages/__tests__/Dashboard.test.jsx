import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import api from '../../services/api';
import logger from '../../utils/logger';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../utils/logger');
vi.mock('../../components/ModernNavbar', () => ({
  default: () => <div data-testid="modern-navbar">Navbar</div>,
}));
vi.mock('../../components/BottomNavigation', () => ({
  default: () => <div data-testid="bottom-navigation">Bottom Nav</div>,
}));
vi.mock('../../components/CalorieRadialChart', () => ({
  default: ({ consumed, goal }) => (
    <div data-testid="calorie-chart">
      {consumed} / {goal} kcal
    </div>
  ),
}));
vi.mock('../../components/MacroBarChart', () => ({
  default: ({ macros }) => (
    <div data-testid="macro-chart">
      Protein: {macros.protein}g, Carbs: {macros.carbs}g, Fat: {macros.fat}g
    </div>
  ),
}));
vi.mock('../../components/WeeklyStatsWidget', () => ({
  default: () => <div data-testid="weekly-stats">Weekly Stats</div>,
}));
vi.mock('../../components/GoalManager', () => ({
  default: ({ currentWeight, onGoalUpdated }) => (
    <div data-testid="goal-manager">
      Weight: {currentWeight || 'N/A'}
      <button onClick={() => onGoalUpdated({ daily_calorie_goal: 2000 })}>
        Update Goal
      </button>
    </div>
  ),
}));
vi.mock('../../components/FirstStepsGuide', () => ({
  default: () => <div data-testid="first-steps-guide">First Steps</div>,
}));
vi.mock('../../components/WeightLineChart', () => ({
  default: ({ macros }) => (
    <div data-testid="weight-chart">Weight Chart - Macros: {JSON.stringify(macros)}</div>
  ),
}));

const mockLog = {
  log_id: 1,
  user_id: 1,
  date: '2024-01-01',
  weight: 70.5,
  consumed_calories: 1500,
  burned_calories: 300,
};

const mockGoal = {
  goal_id: 1,
  user_id: 1,
  target_weight: 65,
  current_weight: 70.5,
  daily_calorie_goal: 2000,
  goal_type: 'weight_loss',
};

const mockMealItems = [
  {
    meal_item_id: 1,
    log_id: 1,
    food_id: 1,
    quantity_grams: 100,
    meal_type: 'Desayuno',
    consumed_calories: 165,
    food: {
      food_id: 1,
      name: 'Pollo',
      calories_base: 165,
      protein_g: 31,
      carbs_g: 0,
      fat_g: 3.6,
    },
  },
];

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  };

  describe('Loading State', () => {
    it('should show loading skeleton initially', () => {
      api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderDashboard();
      // The skeleton should be shown while loading
      expect(screen.queryByTestId('first-steps-guide')).not.toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should fetch daily log and goal on mount', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: mockLog,
            mealItems: mockMealItems,
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: mockGoal,
          },
        });

      renderDashboard();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(expect.stringMatching(/\/logs\/\d{4}-\d{2}-\d{2}/));
        expect(api.get).toHaveBeenCalledWith('/goals');
      });
    });

    it('should display daily log data when loaded', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: mockLog,
            mealItems: mockMealItems,
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: mockGoal,
          },
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        // El peso se muestra como "70.5 kg" en el componente
        expect(screen.getByText(/70\.5\s*kg/i)).toBeInTheDocument();
        // Las calorías quemadas se muestran en algún lugar del componente
        expect(screen.getByText(/300/i)).toBeInTheDocument(); // Calories burned
      });
    });

    it('should handle API errors gracefully', async () => {
      api.get
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'));

      renderDashboard();

      await waitFor(() => {
        expect(logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('Calorie Display', () => {
    it('should display consumed calories', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: mockLog,
            mealItems: mockMealItems,
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: mockGoal,
          },
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('calorie-chart')).toBeInTheDocument();
        expect(screen.getByText(/1500 \/ 2000 kcal/)).toBeInTheDocument();
      });
    });

    it('should use default calorie goal when no goal exists', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: mockLog,
            mealItems: mockMealItems,
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: null,
          },
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/1500 \/ 2000 kcal/)).toBeInTheDocument();
      });
    });
  });

  describe('Macros Display', () => {
    it('should calculate and display macros correctly', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: mockLog,
            mealItems: mockMealItems,
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: mockGoal,
          },
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/31.0g/)).toBeInTheDocument(); // Protein
        expect(screen.getByText(/0.0g/)).toBeInTheDocument(); // Carbs
        expect(screen.getByText(/3.6g/)).toBeInTheDocument(); // Fat
      });
    });

    it('should display meal items count', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: mockLog,
            mealItems: mockMealItems,
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: mockGoal,
          },
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Meal items count
      });
    });
  });

  describe('Goal Management', () => {
    it('should update goal when GoalManager calls onGoalUpdated', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: mockLog,
            mealItems: mockMealItems,
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: mockGoal,
          },
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('goal-manager')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('Update Goal');
      updateButton.click();

      await waitFor(() => {
        // Goal should be refetched
        expect(api.get).toHaveBeenCalledTimes(3); // Initial + refetch
      });
    });
  });

  describe('Components Rendering', () => {
    it('should render all dashboard components', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: mockLog,
            mealItems: mockMealItems,
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: mockGoal,
          },
        });

      renderDashboard();

      await waitFor(() => {
        // Puede haber múltiples navbars, usar getAllByTestId y verificar que al menos uno existe
        const navbars = screen.getAllByTestId('modern-navbar');
        expect(navbars.length).toBeGreaterThan(0);
        expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
        expect(screen.getByTestId('calorie-chart')).toBeInTheDocument();
        expect(screen.getByTestId('macro-chart')).toBeInTheDocument();
        expect(screen.getByTestId('weekly-stats')).toBeInTheDocument();
        expect(screen.getByTestId('goal-manager')).toBeInTheDocument();
        expect(screen.getByTestId('first-steps-guide')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should handle missing log data', async () => {
      api.get
        .mockResolvedValueOnce({
          data: {
            log: null,
            mealItems: [],
          },
        })
        .mockResolvedValueOnce({
          data: {
            goal: null,
          },
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument(); // Weight
        expect(screen.getByText('0')).toBeInTheDocument(); // Calories burned
      });
    });
  });
});

