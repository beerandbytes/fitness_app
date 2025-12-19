import { useEffect } from 'react';

/**
 * Hook para manejar atajos de teclado globales
 */
export const useKeyboardShortcuts = (shortcuts = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si está escribiendo en un input, textarea o contenteditable
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }

      // Construir combinación de teclas
      const key = e.key.toLowerCase();
      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Buscar atajo coincidente
      for (const [shortcut, handler] of Object.entries(shortcuts)) {
        const parts = shortcut.toLowerCase().split('+').map(s => s.trim());
        let matches = true;

        // Verificar Ctrl/Cmd
        if (parts.includes('ctrl') || parts.includes('cmd')) {
          if (!ctrlOrCmd) matches = false;
        } else if (ctrlOrCmd) {
          matches = false;
        }

        // Verificar Shift
        if (parts.includes('shift')) {
          if (!shift) matches = false;
        } else if (shift && !parts.includes('shift')) {
          matches = false;
        }

        // Verificar Alt
        if (parts.includes('alt')) {
          if (!alt) matches = false;
        } else if (alt && !parts.includes('alt')) {
          matches = false;
        }

        // Verificar tecla
        const keyPart = parts.find(p => !['ctrl', 'cmd', 'shift', 'alt'].includes(p));
        if (keyPart && keyPart !== key) {
          matches = false;
        }

        if (matches) {
          e.preventDefault();
          handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

/**
 * Hook para manejar navegación por teclado en listas
 */
export const useKeyboardListNavigation = (items, onSelect, options = {}) => {
  const {
    enabled = true,
    loop = true,
    horizontal = false,
  } = options;

  useEffect(() => {
    if (!enabled || items.length === 0) return;

    let selectedIndex = -1;

    const handleKeyDown = (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
        return;
      }

      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();

      if (horizontal) {
        if (e.key === 'ArrowLeft') {
          selectedIndex = selectedIndex <= 0 ? (loop ? items.length - 1 : 0) : selectedIndex - 1;
        } else if (e.key === 'ArrowRight') {
          selectedIndex = selectedIndex >= items.length - 1 ? (loop ? 0 : items.length - 1) : selectedIndex + 1;
        }
      } else {
        if (e.key === 'ArrowUp') {
          selectedIndex = selectedIndex <= 0 ? (loop ? items.length - 1 : 0) : selectedIndex - 1;
        } else if (e.key === 'ArrowDown') {
          selectedIndex = selectedIndex >= items.length - 1 ? (loop ? 0 : items.length - 1) : selectedIndex + 1;
        }
      }

      if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < items.length) {
        onSelect(items[selectedIndex], selectedIndex);
      }

      if (e.key === 'Escape') {
        selectedIndex = -1;
      }

      // Focus en el elemento seleccionado si existe
      if (selectedIndex >= 0) {
        const element = document.querySelector(`[data-list-item-index="${selectedIndex}"]`);
        if (element) {
          element.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [items, onSelect, enabled, loop, horizontal]);
};

