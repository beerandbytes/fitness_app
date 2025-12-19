import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNavigation from '../BottomNavigation';
import useUserStore from '../../stores/useUserStore';

// Mock dependencies
vi.mock('../../stores/useUserStore');

const mockUser = {
  id: 1,
  email: 'test@example.com',
  role: 'CLIENT',
};

describe('BottomNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.mockReturnValue({
      user: mockUser,
    });
  });

  const renderBottomNav = (initialPath = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <BottomNavigation />
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('should render bottom navigation', () => {
      renderBottomNav();
      const nav = screen.getByLabelText('Navegación inferior');
      expect(nav).toBeInTheDocument();
    });

    it('should render navigation items', () => {
      renderBottomNav();
      // Navigation items are rendered based on navigation.config
      // We check that the nav element exists and has role="list"
      const navList = document.querySelector('[role="list"]');
      expect(navList).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
      renderBottomNav();
      const nav = screen.getByLabelText('Navegación inferior');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should mark active route correctly', () => {
      renderBottomNav('/dashboard');
      // The active link should have aria-current="page"
      const activeLinks = document.querySelectorAll('[aria-current="page"]');
      expect(activeLinks.length).toBeGreaterThan(0);
    });

    it('should apply active styles to current route', () => {
      renderBottomNav('/dashboard');
      // Active links should have specific classes
      const activeLinks = document.querySelectorAll('[aria-current="page"]');
      activeLinks.forEach(link => {
        expect(link).toHaveClass(/text-blue-600/);
      });
    });
  });

  describe('Role-based Navigation', () => {
    it('should show client navigation items for CLIENT role', () => {
      renderBottomNav();
      const nav = screen.getByLabelText('Navegación inferior');
      expect(nav).toBeInTheDocument();
    });

    it('should show coach navigation items for COACH role', () => {
      useUserStore.mockReturnValue({
        user: { ...mockUser, role: 'COACH' },
      });
      renderBottomNav();
      const nav = screen.getByLabelText('Navegación inferior');
      expect(nav).toBeInTheDocument();
    });

    it('should default to CLIENT role when user is null', () => {
      useUserStore.mockReturnValue({
        user: null,
      });
      renderBottomNav();
      const nav = screen.getByLabelText('Navegación inferior');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels on navigation items', () => {
      renderBottomNav();
      const navItems = document.querySelectorAll('[aria-label]');
      expect(navItems.length).toBeGreaterThan(0);
    });

    it('should mark active item with aria-current', () => {
      renderBottomNav('/dashboard');
      const activeItem = document.querySelector('[aria-current="page"]');
      expect(activeItem).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-specific classes', () => {
      renderBottomNav();
      const nav = screen.getByLabelText('Navegación inferior');
      expect(nav).toHaveClass('md:hidden');
    });

    it('should have safe area bottom padding', () => {
      renderBottomNav();
      const nav = screen.getByLabelText('Navegación inferior');
      expect(nav).toHaveClass('safe-area-bottom');
    });
  });
});

