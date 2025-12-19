import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ModernNavbar from '../ModernNavbar';
import useUserStore from '../../stores/useUserStore';
import useBrandStore from '../../stores/useBrandStore';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock dependencies
vi.mock('../../stores/useUserStore');
vi.mock('../../stores/useBrandStore');
vi.mock('../ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));
vi.mock('../NotificationsBell', () => ({
  default: () => <div data-testid="notifications-bell">Notifications Bell</div>,
}));
vi.mock('../NotificationCenter', () => ({
  default: () => <div data-testid="notification-center">Notification Center</div>,
}));
vi.mock('../StreakBadge', () => ({
  default: () => <div data-testid="streak-badge">Streak Badge</div>,
}));
vi.mock('../InviteClientModal', () => ({
  default: ({ open, onOpenChange }) => (
    open ? <div data-testid="invite-modal">Invite Modal</div> : null
  ),
}));
vi.mock('../KeyboardShortcutsModal', () => ({
  default: ({ open, onOpenChange }) => (
    open ? <div data-testid="keyboard-shortcuts-modal">Keyboard Shortcuts</div> : null
  ),
}));

const mockLogout = vi.fn();
const mockUser = {
  id: 1,
  email: 'test@example.com',
  role: 'CLIENT',
};

const mockBrandSettings = {
  brand_name: 'Fitness App',
  logo_url: null,
};

describe('ModernNavbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Mock useUserStore como selector de Zustand
    useUserStore.mockImplementation((selector) => {
      const state = {
        user: mockUser,
        logout: mockLogout,
        isAdmin: () => false,
        isCoach: () => false,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
    useBrandStore.mockReturnValue({
      brandSettings: mockBrandSettings,
    });
  });

  const renderNavbar = (initialPath = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <ModernNavbar />
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('should render navbar with brand name', () => {
      renderNavbar();
      expect(screen.getByText('Fitness App')).toBeInTheDocument();
    });

    it('should render brand initial when logo_url is not provided', () => {
      renderNavbar();
      const logoFallback = document.querySelector('.logo-fallback');
      expect(logoFallback).toBeInTheDocument();
      expect(logoFallback).toHaveTextContent('F');
    });

    it('should render brand logo when logo_url is provided', () => {
      useBrandStore.mockReturnValue({
        brandSettings: {
          ...mockBrandSettings,
          logo_url: 'https://example.com/logo.png',
        },
      });
      renderNavbar();
      const logo = screen.getByAltText('Fitness App');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('should render theme toggle', () => {
      renderNavbar();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render user avatar with first letter of email', () => {
      renderNavbar();
      const avatar = screen.getByLabelText(/menú de usuario/i);
      expect(avatar).toHaveTextContent('T');
    });
  });

  describe('User Menu', () => {
    it('should show user email in dropdown when opened', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      const avatarButton = screen.getByLabelText(/menú de usuario/i);
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('should show logout option in dropdown', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      const avatarButton = screen.getByLabelText(/menú de usuario/i);
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
      });
    });

    it('should call logout when logout is clicked', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      const avatarButton = screen.getByLabelText(/menú de usuario/i);
      await user.click(avatarButton);

      await waitFor(() => {
        const logoutButton = screen.getByText('Cerrar Sesión');
        expect(logoutButton).toBeInTheDocument();
      });

      const logoutButton = screen.getByText('Cerrar Sesión');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledWith(mockNavigate);
      });
    });
  });

  describe('Coach Features', () => {
    it('should show invite client button for coaches', () => {
      useUserStore.mockImplementation((selector) => {
        const state = {
          user: { ...mockUser, role: 'COACH' },
          logout: mockLogout,
          isAdmin: () => false,
          isCoach: () => true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      renderNavbar();
      expect(screen.getByTitle('Invitar Cliente')).toBeInTheDocument();
    });

    it('should open invite modal when invite button is clicked', async () => {
      const user = userEvent.setup();
      useUserStore.mockImplementation((selector) => {
        const state = {
          user: { ...mockUser, role: 'COACH' },
          logout: mockLogout,
          isAdmin: () => false,
          isCoach: () => true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      renderNavbar();
      
      const inviteButton = screen.getByTitle('Invitar Cliente');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
      });
    });

    it('should not show invite button for non-coaches', () => {
      renderNavbar();
      expect(screen.queryByTitle('Invitar Cliente')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should show mobile menu button on mobile', () => {
      renderNavbar();
      const menuButton = screen.getByLabelText('Menú de navegación');
      expect(menuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when menu button is clicked', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      const menuButton = screen.getByLabelText('Menú de navegación');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(menuButton);

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should show mobile logout button when menu is open', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      const menuButton = screen.getByLabelText('Menú de navegación');
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
      });
    });
  });

  describe('Notifications', () => {
    it('should show notification center for authenticated users', () => {
      renderNavbar();
      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
    });

    it('should show streak badge for non-coach users', () => {
      renderNavbar();
      expect(screen.getByTestId('streak-badge')).toBeInTheDocument();
    });

    it('should not show streak badge for coaches', () => {
      useUserStore.mockImplementation((selector) => {
        const state = {
          user: { ...mockUser, role: 'COACH' },
          logout: mockLogout,
          isAdmin: () => false,
          isCoach: () => true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      renderNavbar();
      expect(screen.queryByTestId('streak-badge')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render navigation links for authenticated users', () => {
      renderNavbar();
      // Navigation links are rendered based on navigation.config
      // We check that the nav element exists
      const nav = screen.getByLabelText('Navegación principal');
      expect(nav).toBeInTheDocument();
    });

    it('should link to dashboard for clients', () => {
      renderNavbar();
      const logoLink = screen.getByText('Fitness App').closest('a');
      expect(logoLink).toHaveAttribute('href', '/dashboard');
    });

    it('should link to coach dashboard for coaches', () => {
      useUserStore.mockImplementation((selector) => {
        const state = {
          user: { ...mockUser, role: 'COACH' },
          logout: mockLogout,
          isAdmin: () => false,
          isCoach: () => true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      renderNavbar();
      const logoLink = screen.getByText('Fitness App').closest('a');
      expect(logoLink).toHaveAttribute('href', '/coach/dashboard');
    });
  });

  describe('Admin Features', () => {
    it('should link to admin dashboard for admins', () => {
      useUserStore.mockImplementation((selector) => {
        const state = {
          user: { ...mockUser, role: 'ADMIN' },
          logout: mockLogout,
          isAdmin: () => true,
          isCoach: () => false,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      renderNavbar();
      const logoLink = screen.getByText('Fitness App').closest('a');
      expect(logoLink).toHaveAttribute('href', '/coach/dashboard');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should open keyboard shortcuts modal when option is selected', async () => {
      const user = userEvent.setup();
      renderNavbar();
      
      const avatarButton = screen.getByLabelText(/menú de usuario/i);
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('Atajos de Teclado')).toBeInTheDocument();
      });

      const shortcutsOption = screen.getByText('Atajos de Teclado');
      await user.click(shortcutsOption);

      await waitFor(() => {
        expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
      });
    });
  });
});

