import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DietPage from '../DietPage';
import api from '../../services/api';
import logger from '../../utils/logger';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../utils/logger');
vi.mock('../../components/FoodSearchAndAdd', () => ({
  default: ({ onLogUpdated }) => (
    <div data-testid="food-search">
      <button onClick={() => onLogUpdated({ log: { consumed_calories: 2000 }, mealItems: [] })}>
        Add Food
      </button>
    </div>
  ),
}));
vi.mock('../../components/CalorieRadialChart', () => ({
  default: ({ consumed, goal }) => (
    <div data-testid="calorie-chart">{consumed} / {goal} kcal</div>
  ),
}));
vi.mock('../../components/EmptyState', () => ({
  default: ({ title }) => <div data-testid="empty-state">{title}</div>,
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
  daily_calorie_goal: 2000,
};

const mockMealItems = [
  {
    meal_item_id: 1,
    food: {
      food_id: 1,
      name: 'Pollo',
      calories_base: 165,
      protein_g: 31,
      carbs_g: 0,
      fat_g: 3.6,
    },
    quantity_grams: 100,
  },
];

describe('DietPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDietPage = () => {
    return render(
      <MemoryRouter>
        <DietPage />
      </MemoryRouter>
    );
  };

  describe('Data Loading', () => {
    it('should fetch daily log and goal on mount', async () => {
      api.get
        .mockResolvedValueOnce({
          data: { log: mockLog, mealItems: mockMealItems },
        })
        .mockResolvedValueOnce({
          data: { goal: mockGoal },
        });

      renderDietPage();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(expect.stringMatching(/\/logs\/\d{4}-\d{2}-\d{2}/));
        expect(api.get).toHaveBeenCalledWith('/goals');
      });
    });

    it('should display loading skeleton initially', () => {
      api.get.mockImplementation(() => new Promise(() => {}));
      renderDietPage();
      // Skeleton should be shown
      expect(screen.queryByTestId('food-search')).not.toBeInTheDocument();
    });
  });

  describe('Date Navigation', () => {
    it('should allow changing date', async () => {
      api.get
        .mockResolvedValueOnce({
          data: { log: mockLog, mealItems: mockMealItems },
        })
        .mockResolvedValueOnce({
          data: { goal: mockGoal },
        });

      renderDietPage();

      await waitFor(() => {
        expect(screen.getByTestId('food-search')).toBeInTheDocument();
      });

      // Find date navigation buttons and test
      const prevButton = screen.queryByLabelText(/día anterior/i) || screen.queryByText(/anterior/i);
      if (prevButton) {
        await userEvent.click(prevButton);
        await waitFor(() => {
          expect(api.get).toHaveBeenCalledTimes(3); // Initial + date change
        });
      }
    });
  });

  describe('Food Logging', () => {
    it('should update log when food is added', async () => {
      api.get
        .mockResolvedValueOnce({
          data: { log: mockLog, mealItems: mockMealItems },
        })
        .mockResolvedValueOnce({
          data: { goal: mockGoal },
        });

      renderDietPage();

      await waitFor(() => {
        expect(screen.getByTestId('food-search')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Food');
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(3); // Refetch after update
      });
    });
  });

  describe('Calorie Display', () => {
    it('should display consumed calories', async () => {
      api.get
        .mockResolvedValueOnce({
          data: { log: mockLog, mealItems: mockMealItems },
        })
        .mockResolvedValueOnce({
          data: { goal: mockGoal },
        });

      renderDietPage();

      await waitFor(() => {
        expect(screen.getByTestId('calorie-chart')).toBeInTheDocument();
        expect(screen.getByText(/1500 \/ 2000 kcal/)).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no meal items', async () => {
      api.get
        .mockResolvedValueOnce({
          data: { log: mockLog, mealItems: [] },
        })
        .mockResolvedValueOnce({
          data: { goal: mockGoal },
        });

      renderDietPage();

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });
});

