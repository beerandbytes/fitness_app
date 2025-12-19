/**
 * Utilidades de accesibilidad
 * Funciones helper para mejorar la accesibilidad de la aplicación
 */

/**
 * Manejar navegación por teclado en listas
 * @param {KeyboardEvent} event - Evento de teclado
 * @param {string} currentId - ID del elemento actual
 * @param {string[]} itemIds - Array de IDs de elementos
 * @param {Function} onSelect - Callback cuando se selecciona un elemento
 */
export const handleKeyboardNavigation = (event, currentId, itemIds, onSelect) => {
  const currentIndex = itemIds.indexOf(currentId);
  
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight': {
      event.preventDefault();
      const nextIndex = currentIndex < itemIds.length - 1 ? currentIndex + 1 : 0;
      onSelect(itemIds[nextIndex]);
      break;
    }
    case 'ArrowUp':
    case 'ArrowLeft': {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemIds.length - 1;
      onSelect(itemIds[prevIndex]);
      break;
    }
    case 'Home':
      event.preventDefault();
      onSelect(itemIds[0]);
      break;
    case 'End':
      event.preventDefault();
      onSelect(itemIds[itemIds.length - 1]);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect(currentId);
      break;
    default:
      break;
  }
};

/**
 * Generar ID único para aria-describedby
 */
export const generateAriaId = (prefix) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Verificar si el usuario está usando un lector de pantalla
 * Nota: Esta es una aproximación, no es 100% precisa
 */
export const isScreenReaderActive = () => {
  if (typeof window === 'undefined') return false;
  
  // Detectar si hay un lector de pantalla activo
  // Esto es una aproximación basada en características comunes
  const hasAriaLive = document.querySelector('[aria-live]');
  const hasRole = document.querySelector('[role]');
  
  // Otra aproximación: verificar si el usuario navega solo con teclado
  let keyboardOnly = false;
  document.addEventListener('keydown', () => {
    keyboardOnly = true;
  }, { once: true });
  
  return hasAriaLive || hasRole || keyboardOnly;
};

/**
 * Anunciar cambios a lectores de pantalla
 * @param {string} message - Mensaje a anunciar
 * @param {string} priority - 'polite' o 'assertive'
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Manejar focus trap en modales
 * @param {HTMLElement} container - Contenedor del modal
 * @param {KeyboardEvent} event - Evento de teclado
 */
export const handleFocusTrap = (container, event) => {
  if (event.key !== 'Tab') return;
  
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

/**
 * Enfocar el primer elemento enfocable en un contenedor
 * @param {HTMLElement} container - Contenedor donde buscar
 */
export const focusFirstElement = (container) => {
  if (!container) return;
  
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
};

/**
 * Restaurar foco al elemento que tenía foco antes de abrir un modal
 * @param {HTMLElement} previousElement - Elemento que tenía foco antes
 */
export const restoreFocus = (previousElement) => {
  if (previousElement && typeof previousElement.focus === 'function') {
    previousElement.focus();
  }
};

/**
 * Cerrar modal y restaurar foco
 * @param {HTMLElement} previousElement - Elemento que tenía foco antes
 * @param {Function} onClose - Función para cerrar el modal
 */
export const closeModalAndRestoreFocus = (previousElement, onClose) => {
  onClose();
  setTimeout(() => {
    restoreFocus(previousElement);
  }, 100);
};

/**
 * Validar atributos ARIA
 * @param {HTMLElement} element - Elemento a validar
 * @returns {Object} - Objeto con errores encontrados
 */
export const validateAriaAttributes = (element) => {
  const errors = [];
  
  // Verificar que aria-labelledby apunta a un elemento existente
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy && !document.getElementById(labelledBy)) {
    errors.push(`aria-labelledby="${labelledBy}" apunta a un elemento inexistente`);
  }
  
  // Verificar que aria-describedby apunta a un elemento existente
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy && !document.getElementById(describedBy)) {
    errors.push(`aria-describedby="${describedBy}" apunta a un elemento inexistente`);
  }
  
  // Verificar que aria-controls apunta a un elemento existente
  const controls = element.getAttribute('aria-controls');
  if (controls && !document.getElementById(controls)) {
    errors.push(`aria-controls="${controls}" apunta a un elemento inexistente`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Verificar contraste de colores (WCAG AA)
 * @param {string} foreground - Color de primer plano (hex)
 * @param {string} background - Color de fondo (hex)
 * @returns {Object} - Resultado de la validación
 */
export const checkColorContrast = (foreground, background) => {
  // Convertir hex a RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };
  
  // Calcular luminancia relativa
  const getLuminance = (rgb) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) {
    return { isValid: false, ratio: 0, error: 'Colores inválidos' };
  }
  
  const fgLum = getLuminance(fgRgb);
  const bgLum = getLuminance(bgRgb);
  
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  // WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande
  const passesAA = ratio >= 4.5;
  const passesAALarge = ratio >= 3;
  const passesAAA = ratio >= 7; // WCAG AAA
  
  return {
    isValid: passesAA,
    ratio: Math.round(ratio * 100) / 100,
    passesAA,
    passesAALarge,
    passesAAA,
  };
};