import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WeightTrackingPage from '../WeightTrackingPage';
import api from '../../services/api';

vi.mock('../../services/api');

describe('WeightTrackingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render weight tracking page', async () => {
    api.get.mockResolvedValueOnce({
      data: { data: [] },
    });

    render(
      <MemoryRouter>
        <WeightTrackingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });
});

