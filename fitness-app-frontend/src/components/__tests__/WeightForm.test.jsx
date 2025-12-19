import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import WeightForm from '../WeightForm';
import api from '../../services/api';

// Mock de la API
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock de useToastStore
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock('../../stores/useToastStore', () => ({
  default: () => mockToast,
}));

// Mock de date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-15'),
}));

vi.mock('date-fns/locale', () => ({
  es: {},
}));

describe('WeightForm', () => {
  const mockOnLogUpdated = vi.fn();
  const mockCurrentDate = new Date('2024-01-15');
  const mockCurrentWeight = '75.5';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el formulario correctamente', () => {
    render(
      <BrowserRouter>
        <WeightForm 
          currentDate={mockCurrentDate} 
          currentWeight={mockCurrentWeight}
          onLogUpdated={mockOnLogUpdated}
        />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/peso actual/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /actualizar peso/i })).toBeInTheDocument();
  });

  it('debe mostrar el peso actual si está disponible', () => {
    render(
      <BrowserRouter>
        <WeightForm 
          currentDate={mockCurrentDate} 
          currentWeight={mockCurrentWeight}
          onLogUpdated={mockOnLogUpdated}
        />
      </BrowserRouter>
    );

    const input = screen.getByLabelText(/peso actual/i);
    expect(input).toHaveValue(75.5);
  });

  it('debe validar que el peso esté en el rango válido', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <WeightForm 
          currentDate={mockCurrentDate} 
          currentWeight={null}
          onLogUpdated={mockOnLogUpdated}
        />
      </BrowserRouter>
    );

    const input = screen.getByLabelText(/peso actual/i);
    const submitButton = screen.getByRole('button', { name: /registrar nuevo peso/i });

    // Intentar con un peso muy bajo
    await user.clear(input);
    await user.type(input, '10');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el peso debe ser al menos 20 kg/i)).toBeInTheDocument();
    });

    // Intentar con un peso muy alto
    await user.clear(input);
    await user.type(input, '500');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el peso no puede exceder 300 kg/i)).toBeInTheDocument();
    });
  });

  it('debe enviar el formulario con datos válidos', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        message: 'Peso registrado correctamente',
        log: { weight: 80.5 },
      },
    };

    api.post.mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <WeightForm 
          currentDate={mockCurrentDate} 
          currentWeight={null}
          onLogUpdated={mockOnLogUpdated}
        />
      </BrowserRouter>
    );

    const input = screen.getByLabelText(/peso actual/i);
    const submitButton = screen.getByRole('button', { name: /registrar nuevo peso/i });

    await user.clear(input);
    await user.type(input, '80.5');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/logs', {
        date: '2024-01-15',
        weight: '80.50',
      });
      expect(mockOnLogUpdated).toHaveBeenCalledWith(mockResponse.data.log);
    });
  });

  it('debe manejar errores de la API', async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: { error: 'Error al actualizar el peso' },
      },
    };

    api.post.mockRejectedValue(mockError);

    render(
      <BrowserRouter>
        <WeightForm 
          currentDate={mockCurrentDate} 
          currentWeight={null}
          onLogUpdated={mockOnLogUpdated}
        />
      </BrowserRouter>
    );

    const input = screen.getByLabelText(/peso actual/i);
    // Buscar el botón por su aria-label
    const submitButton = screen.getByRole('button', { name: /registrar nuevo peso/i });

    await user.clear(input);
    await user.type(input, '80.5');
    
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      // Verificar que se llamó al toast de error
      expect(mockToast.error).toHaveBeenCalled();
    }, { timeout: 3000 });

    // El error se maneja internamente, no se llama a onLogUpdated
    expect(mockOnLogUpdated).not.toHaveBeenCalled();
  });
});

