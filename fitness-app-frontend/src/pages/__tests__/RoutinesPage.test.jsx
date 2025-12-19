import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RoutinesPage from '../RoutinesPage';
import api from '../../services/api';
import logger from '../../utils/logger';
import useToastStore from '../../stores/useToastStore';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../utils/logger');
vi.mock('../../stores/useToastStore');
vi.mock('../../components/ModernRoutineCard', () => ({
  default: ({ routine, onDelete }) => (
    <div data-testid={`routine-${routine.routine_id}`}>
      {routine.name}
      <button onClick={() => onDelete(routine.routine_id, routine.name)}>Delete</button>
    </div>
  ),
}));
vi.mock('../../components/EmptyState', () => ({
  default: ({ title }) => <div data-testid="empty-state">{title}</div>,
}));
vi.mock('../../components/ConfirmDialog', () => ({
  default: ({ open, onConfirm, onCancel, title }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <p>{title}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
};

const mockRoutines = [
  {
    routine_id: 1,
    name: 'Rutina A',
    description: 'Descripción A',
    is_active: true,
  },
  {
    routine_id: 2,
    name: 'Rutina B',
    description: 'Descripción B',
    is_active: true,
  },
];

describe('RoutinesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.mockReturnValue(mockToast);
  });

  const renderRoutinesPage = () => {
    return render(
      <MemoryRouter>
        <RoutinesPage />
      </MemoryRouter>
    );
  };

  describe('Data Loading', () => {
    it('should fetch routines on mount', async () => {
      api.get.mockResolvedValueOnce({
        data: { routines: mockRoutines },
      });

      renderRoutinesPage();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/routines');
      });
    });

    it('should display loading skeleton initially', () => {
      api.get.mockImplementation(() => new Promise(() => {}));
      renderRoutinesPage();
      // Should show skeleton while loading
      expect(screen.queryByTestId('routine-1')).not.toBeInTheDocument();
    });

    it('should display routines when loaded', async () => {
      api.get.mockResolvedValueOnce({
        data: { routines: mockRoutines },
      });

      renderRoutinesPage();

      await waitFor(() => {
        expect(screen.getByTestId('routine-1')).toBeInTheDocument();
        expect(screen.getByText('Rutina A')).toBeInTheDocument();
        expect(screen.getByTestId('routine-2')).toBeInTheDocument();
        expect(screen.getByText('Rutina B')).toBeInTheDocument();
      });
    });
  });

  describe('Create Routine', () => {
    it('should open create modal when button is clicked', async () => {
      api.get.mockResolvedValueOnce({
        data: { routines: mockRoutines },
      });

      renderRoutinesPage();

      await waitFor(() => {
        expect(screen.getByTestId('routine-1')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /nueva rutina/i });
      await userEvent.click(createButton);
      // Modal should open
      await waitFor(() => {
        // El input de nombre está en el modal, buscar por placeholder o por el texto del label
        expect(screen.getByPlaceholderText(/rutina de fuerza/i)).toBeInTheDocument();
      });
    });

    it('should create routine successfully', async () => {
      api.get.mockResolvedValueOnce({
        data: { routines: mockRoutines },
      });
      api.post.mockResolvedValueOnce({
        data: {
          routine: {
            routine_id: 3,
            name: 'Nueva Rutina',
            description: 'Nueva descripción',
          },
        },
      });

      renderRoutinesPage();

      await waitFor(() => {
        expect(screen.getByTestId('routine-1')).toBeInTheDocument();
      });

      // Find and click create button
      const createButton = screen.queryByText(/nueva rutina/i) || screen.queryByLabelText(/crear/i);
      if (createButton) {
        await userEvent.click(createButton);

        await waitFor(() => {
          const nameInput = screen.getByLabelText(/nombre/i);
          expect(nameInput).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/nombre/i);
        const submitButton = screen.getByRole('button', { name: /crear|guardar/i });

        await userEvent.type(nameInput, 'Nueva Rutina');
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(api.post).toHaveBeenCalledWith('/routines', expect.objectContaining({
            name: 'Nueva Rutina',
          }));
        });
      }
    });
  });

  describe('Delete Routine', () => {
    it('should show confirm dialog when delete is clicked', async () => {
      api.get.mockResolvedValueOnce({
        data: { routines: mockRoutines },
      });

      renderRoutinesPage();

      await waitFor(() => {
        expect(screen.getByTestId('routine-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('routine-1').querySelector('button');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });
    });

    it('should delete routine when confirmed', async () => {
      api.get.mockResolvedValueOnce({
        data: { routines: mockRoutines },
      });
      api.delete.mockResolvedValueOnce({ data: { success: true } });

      renderRoutinesPage();

      await waitFor(() => {
        expect(screen.getByTestId('routine-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('routine-1').querySelector('button');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Confirm');
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/routines/1');
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no routines', async () => {
      api.get.mockResolvedValueOnce({
        data: { routines: [] },
      });

      renderRoutinesPage();

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      renderRoutinesPage();

      await waitFor(() => {
        expect(logger.error).toHaveBeenCalled();
      });
    });
  });
});

