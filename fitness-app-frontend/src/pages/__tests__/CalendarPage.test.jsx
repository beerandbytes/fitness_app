import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CalendarPage from '../CalendarPage';
import api from '../../services/api';

vi.mock('../../services/api');

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render calendar page', () => {
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>
    );
    // Basic rendering test
    expect(screen.getByRole('main') || document.body).toBeInTheDocument();
  });
});

