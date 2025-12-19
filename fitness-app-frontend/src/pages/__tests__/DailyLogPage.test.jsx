import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DailyLogPage from '../DailyLogPage';
import api from '../../services/api';

vi.mock('../../services/api');

describe('DailyLogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render daily log page', async () => {
    api.get.mockResolvedValueOnce({
      data: { log: null, mealItems: [], dailyExercises: [] },
    });

    render(
      <MemoryRouter>
        <DailyLogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });
});

