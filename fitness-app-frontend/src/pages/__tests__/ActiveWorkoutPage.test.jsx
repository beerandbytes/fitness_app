import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ActiveWorkoutPage from '../ActiveWorkoutPage';
import api from '../../services/api';
import logger from '../../utils/logger';
import useToastStore from '../../stores/useToastStore';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../utils/logger');
vi.mock('../../stores/useToastStore');

// Mock child components to isolate ActiveWorkoutPage logic
vi.mock('../../components/WorkoutTimer', () => ({
    default: () => <div data-testid="workout-timer">Timer</div>,
}));
vi.mock('../../components/ActiveWorkoutPageSkeleton', () => ({
    ActiveWorkoutPageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));
vi.mock('../../components/ModernNavbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
};

const mockRoutine = {
    routine_id: 1,
    name: 'Test Routine',
    description: 'Test Description',
    is_active: true,
    exercises: [
        {
            routine_exercise_id: 1,
            exercise_id: 101,
            exercise_name: 'Push Up',
            category: 'Strength',
            sets: 3,
            reps: 10,
            weight_kg: 0,
        },
        {
            routine_exercise_id: 2,
            exercise_id: 102,
            exercise_name: 'Squat',
            category: 'Legs',
            sets: 4,
            reps: 12,
            weight_kg: 50,
        }
    ]
};

describe('ActiveWorkoutPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useToastStore.mockReturnValue(mockToast);
        // Mock window methods that might be called
        window.confirm = vi.fn().mockReturnValue(true);
        // Mock speech synthesis
        Object.defineProperty(window, 'speechSynthesis', {
            value: {
                speak: vi.fn(),
                cancel: vi.fn(),
            },
            writable: true,
        });
        Object.defineProperty(window, 'SpeechSynthesisUtterance', {
            value: vi.fn(),
            writable: true
        });
    });

    const renderPage = (routineId = '1') => {
        return render(
            <MemoryRouter initialEntries={[`/routines/${routineId}/workout`]}>
                <Routes>
                    <Route path="/routines/:routineId/workout" element={<ActiveWorkoutPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('should render loading skeleton initially', async () => {
        // Return a promise that never resolves to keep in loading state, or resolves later
        api.get.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ data: { routine: mockRoutine } }), 100)));

        renderPage();
        expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should render routine details after loading', async () => {
        api.get.mockResolvedValue({
            data: { routine: mockRoutine },
        });

        // Mock history fetch call
        api.get.mockResolvedValueOnce({
            data: { routine: mockRoutine }
        }).mockResolvedValue({
            data: { workouts: [] } // For history calls
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Test Routine')).toBeInTheDocument();
            // "Push Up" appears multiple times (header, list, etc), verifying at least one exists is enough
            expect(screen.getAllByText('Push Up').length).toBeGreaterThan(0);
        });
    });

    it('should handle error when loading routine fails', async () => {
        api.get.mockRejectedValue(new Error('Failed to load'));

        renderPage();

        await waitFor(() => {
            expect(logger.error).toHaveBeenCalled();
            expect(mockToast.error).toHaveBeenCalledWith('Error al cargar la rutina');
        });
    });
});
