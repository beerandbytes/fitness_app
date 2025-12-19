import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('debe renderizar el título y descripción', () => {
    render(
      <EmptyState
        title="No hay datos"
        description="No se encontraron elementos"
      />
    );

    expect(screen.getByText(/no hay datos/i)).toBeInTheDocument();
    expect(screen.getByText(/no se encontraron elementos/i)).toBeInTheDocument();
  });

  it('debe renderizar el botón de acción cuando se proporciona', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="No hay datos"
        description="No se encontraron elementos"
        actionLabel="Crear nuevo"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole('button', { name: /crear nuevo/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar el icono cuando se proporciona', () => {
    const TestIcon = () => <svg data-testid="test-icon" />;

    render(
      <EmptyState
        title="No hay datos"
        description="No se encontraron elementos"
        icon={TestIcon}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('debe renderizar children cuando se proporcionan', () => {
    render(
      <EmptyState
        title="No hay datos"
        description="No se encontraron elementos"
      >
        <div data-testid="custom-content">Contenido personalizado</div>
      </EmptyState>
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText(/contenido personalizado/i)).toBeInTheDocument();
  });
});








