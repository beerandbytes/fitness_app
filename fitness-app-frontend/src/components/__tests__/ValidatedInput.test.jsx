import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
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

    const input = screen.getByLabelText(/nombre/i);
    expect(input).toHaveValue('Juan');
  });

  it('debe mostrar mensaje de error cuando hay error', () => {
    render(
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        error="El email es requerido"
      />
    );

    expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
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

    const input = screen.getByLabelText(/nombre/i);
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('debe aplicar clases de error cuando hay error', () => {
    const { container } = render(
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        error="Error de validación"
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveClass(/border-red/i);
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

    const input = screen.getByLabelText(/email/i);
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








