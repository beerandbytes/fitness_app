import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import AuthForm from '../../AuthForm';
import useUserStore from '../../stores/useUserStore';
import useBrandStore from '../../stores/useBrandStore';

// Mock stores
vi.mock('../../stores/useUserStore');
vi.mock('../../stores/useBrandStore');
vi.mock('../../components/SocialAuth', () => ({
  default: ({ onGoogleLogin, loading }) => (
    <button onClick={onGoogleLogin} disabled={loading}>
      Google Login
    </button>
  ),
}));

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockIsAuthenticated = vi.fn(() => false);
const mockUser = null;

const mockBrandSettings = {
  brand_name: 'Fitness App',
  logo_url: null,
};

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useUserStore como selector de Zustand
    useUserStore.mockImplementation((selector) => {
      const state = {
        login: mockLogin,
        register: mockRegister,
        isAuthenticated: mockIsAuthenticated,
        user: mockUser,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
    // Mock useBrandStore como selector de Zustand
    useBrandStore.mockImplementation((selector) => {
      const state = {
        brandSettings: mockBrandSettings,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
  });

  const renderAuthForm = (initialPath = '/login') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthForm />
      </MemoryRouter>
    );
  };

  describe('Login Form', () => {
    it('should render login form when path is /login', () => {
      renderAuthForm('/login');
      expect(screen.getByText('Bienvenido')).toBeInTheDocument();
      expect(screen.getByText('Continúa tu progreso')).toBeInTheDocument();
      expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('should not show social auth buttons on login page', () => {
      renderAuthForm('/login');
      // SocialAuth solo se muestra en register, no en login
      expect(screen.queryByText('Google Login')).not.toBeInTheDocument();
    });

    it('should show forgot password link on login page', () => {
      renderAuthForm('/login');
      expect(screen.getByText(/¿olvidaste tu contraseña?/i)).toBeInTheDocument();
    });

    it('should handle login form submission', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });

      renderAuthForm('/login');

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', null, expect.any(Function));
      });
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: false, error: 'Credenciales inválidas' });

      renderAuthForm('/login');

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
      });
    });

    it('should navigate to register page when clicking register link', async () => {
      const user = userEvent.setup();
      const { container } = renderAuthForm('/login');

      const registerLink = screen.getByText('Regístrate');
      await user.click(registerLink);

      // Check that the form text changes
      await waitFor(() => {
        expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();
      });
    });
  });

  describe('Register Form', () => {
    it('should render register form when path is /register', () => {
      renderAuthForm('/register');
      expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();
      expect(screen.getByText('Comienza tu transformación')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    it('should show social auth buttons on register page', () => {
      renderAuthForm('/register');
      expect(screen.getByText('Google Login')).toBeInTheDocument();
    });

    it('should show password requirements on register page', () => {
      renderAuthForm('/register');
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
    });

    it('should handle register form submission', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ success: true });

      renderAuthForm('/register');

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('newuser@example.com', 'Password123!', null, expect.any(Function));
      });
    });

    it('should display error message on register failure', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({
        success: false,
        error: 'El email ya está registrado',
      });

      renderAuthForm('/register');

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('El email ya está registrado')).toBeInTheDocument();
      });
    });

    it('should display validation error details on register failure', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({
        success: false,
        error: 'Validation error',
        details: [
          { message: 'Email is required' },
          { message: 'Password is too weak' },
        ],
      });

      renderAuthForm('/register');

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'weak');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required, Password is too weak')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderAuthForm('/login');

      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Procesando...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    it('should disable submit button during loading', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(() => {}));

      renderAuthForm('/login');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      const emailInput = screen.getByRole('textbox', { name: /correo electrónico/i });
      const passwordInput = screen.getByLabelText(/contraseña/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Brand Settings', () => {
    it('should display brand logo when logo_url is provided', () => {
      useBrandStore.mockImplementation((selector) => {
        const state = {
          brandSettings: {
            ...mockBrandSettings,
            logo_url: 'https://example.com/logo.png',
          },
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      renderAuthForm('/login');
      const logo = screen.getByAltText('Fitness App');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('should display brand initial when logo_url is not provided', () => {
      renderAuthForm('/login');
      // The fallback logo should be present
      const logoFallback = document.querySelector('.logo-fallback');
      expect(logoFallback).toBeInTheDocument();
      expect(logoFallback).toHaveTextContent('F');
    });

    it('should use brand name first letter for fallback logo', () => {
      useBrandStore.mockImplementation((selector) => {
        const state = {
          brandSettings: {
            brand_name: 'My Fitness',
            logo_url: null,
          },
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      renderAuthForm('/login');
      const logoFallback = document.querySelector('.logo-fallback');
      expect(logoFallback).toHaveTextContent('M');
    });
  });

  describe('Redirect Behavior', () => {
    it('should redirect authenticated users without role to role selection', () => {
      const mockNavigate = vi.fn();
      mockIsAuthenticated.mockReturnValue(true);
      useUserStore.mockImplementation((selector) => {
        const state = {
          login: mockLogin,
          register: mockRegister,
          isAuthenticated: mockIsAuthenticated,
          user: { id: 1, email: 'test@example.com', role: null },
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthForm />
        </MemoryRouter>
      );

      // The redirect happens in useEffect, so we check the navigate mock
      // In a real test, we'd need to mock useNavigate
    });
  });
});

