import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValidatedInput from '../ValidatedInput';

describe('ValidatedInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el input correctamente', () => {
    render(
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    expect(input).toBeInTheDocument();
  });

  it('debe mostrar el valor del input', () => {
    render(
      <ValidatedInput
        label="Nombre"
        name="name"
        type="text"
        value="Juan"
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('textbox', { name: /nombre/i });
    expect(input).toHaveValue('Juan');
  });

  it('debe mostrar mensaje de error cuando hay error', async () => {
    const user = userEvent.setup();
    render(
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        errorMessage="El email es requerido"
        validator={(value) => ({ valid: false, message: 'El email es requerido' })}
      />
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    await user.type(input, 'test');
    await user.tab(); // Trigger blur to set isTouched

    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
    });
  });

  it('debe llamar onChange cuando el usuario escribe', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ValidatedInput
        label="Nombre"
        name="name"
        type="text"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox', { name: /nombre/i });
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('debe aplicar clases de error cuando hay error', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        errorMessage="Error de validación"
        validator={(value) => ({ valid: false, message: 'Error de validación' })}
      />
    );

    const input = container.querySelector('input');
    await user.type(input, 'test');
    await user.tab(); // Trigger blur to set isTouched

    await waitFor(() => {
      expect(input).toHaveClass(/border-red/i);
    });
  });

  it('debe mostrar el placeholder cuando se proporciona', () => {
    render(
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        placeholder="ejemplo@email.com"
      />
    );

    expect(screen.getByPlaceholderText(/ejemplo@email.com/i)).toBeInTheDocument();
  });

  it('debe deshabilitar el input cuando disabled es true', () => {
    render(
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        disabled
      />
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    expect(input).toBeDisabled();
  });

  it('debe mostrar el texto de ayuda cuando se proporciona', () => {
    render(
      <ValidatedInput
        label="Contraseña"
        name="password"
        type="password"
        value=""
        onChange={() => {}}
        helpText="Mínimo 8 caracteres"
      />
    );

    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
  });
});








