import React, { useEffect, useCallback } from 'react';

/**
 * Hook para mejorar la navegación por teclado
 * Agrega soporte para navegación con flechas, Enter, Escape, etc.
 */
export const useKeyboardNavigation = ({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  onTab,
  enabled = true,
  preventDefault = true,
}) => {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    switch (event.key) {
      case 'ArrowUp':
        if (onArrowUp) {
          if (preventDefault) event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          if (preventDefault) event.preventDefault();
          onArrowDown(event);
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          if (preventDefault) event.preventDefault();
          onArrowLeft(event);
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          if (preventDefault) event.preventDefault();
          onArrowRight(event);
        }
        break;
      case 'Enter':
        if (onEnter) {
          if (preventDefault) event.preventDefault();
          onEnter(event);
        }
        break;
      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          onEscape(event);
        }
        break;
      case 'Tab':
        if (onTab) {
          onTab(event);
        }
        break;
      default:
        break;
    }
  }, [enabled, preventDefault, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onTab]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
};

/**
 * Hook para hacer elementos focusables y navegables por teclado
 */
export const useFocusable = (ref, options = {}) => {
  const {
    tabIndex = 0,
    role = 'button',
    onClick,
    onKeyDown,
  } = options;

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('tabindex', tabIndex);
      ref.current.setAttribute('role', role);
      
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) {
            onClick(e);
          }
        }
        if (onKeyDown) {
          onKeyDown(e);
        }
      };

      ref.current.addEventListener('keydown', handleKeyDown);
      return () => {
        if (ref.current) {
          ref.current.removeEventListener('keydown', handleKeyDown);
        }
      };
    }
  }, [ref, tabIndex, role, onClick, onKeyDown]);
};

/**
 * Hook para manejar navegación por teclado en listas
 */
export const useListKeyboardNavigation = (items, onSelect, options = {}) => {
  const {
    enabled = true,
    initialIndex = 0,
  } = options;

  const [focusedIndex, setFocusedIndex] = React.useState(initialIndex);

  useKeyboardNavigation({
    enabled,
    onArrowUp: () => {
      setFocusedIndex(prev => Math.max(0, prev - 1));
    },
    onArrowDown: () => {
      setFocusedIndex(prev => Math.min(items.length - 1, prev + 1));
    },
    onEnter: () => {
      if (items[focusedIndex] && onSelect) {
        onSelect(items[focusedIndex], focusedIndex);
      }
    },
  });

  return { focusedIndex, setFocusedIndex };
};

