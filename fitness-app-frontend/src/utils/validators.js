// Utilidades de validación centralizadas

/**
 * Valida un email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un valor sea un número válido
 */
export const isValidNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

/**
 * Valida que un valor no esté vacío
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Valida un peso (kg)
 */
export const isValidWeight = (weight) => {
  return isValidNumber(weight, 20, 300); // Rango razonable: 20-300 kg
};

/**
 * Valida calorías
 */
export const isValidCalories = (calories) => {
  return isValidNumber(calories, 0, 10000); // Rango razonable: 0-10000 kcal
};

/**
 * Valida una fecha
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

/**
 * Valida que una fecha no sea futura
 */
export const isNotFutureDate = (date) => {
  if (!isValidDate(date)) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj <= new Date();
};

/**
 * Valida una contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
 */
export const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Valida una URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================
// VALIDADORES PARA ValidatedInput
// Retornan objetos con { valid: boolean, message: string }
// ============================================

/**
 * Validador de email para ValidatedInput
 */
export const emailValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'El email es requerido' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { valid: false, message: 'Por favor ingresa un email válido' };
  }
  
  return { valid: true, message: 'Email válido' };
};

/**
 * Validador de contraseña para ValidatedInput
 */
export const passwordValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  
  if (value.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(value)) {
    return { valid: false, message: 'Debe incluir al menos una mayúscula' };
  }
  
  if (!/[a-z]/.test(value)) {
    return { valid: false, message: 'Debe incluir al menos una minúscula' };
  }
  
  if (!/[0-9]/.test(value)) {
    return { valid: false, message: 'Debe incluir al menos un número' };
  }
  
  if (!/[@$!%*?&]/.test(value)) {
    return { valid: false, message: 'Debe incluir al menos un carácter especial (@$!%*?&)' };
  }
  
  return { valid: true, message: 'Contraseña segura' };
};

/**
 * Validador de edad para ValidatedInput
 */
export const ageValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'La edad es requerida' };
  }
  
  const age = parseInt(value);
  if (isNaN(age) || age < 1 || age > 120) {
    return { valid: false, message: 'Por favor ingresa una edad válida (1-120)' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validador de altura para ValidatedInput
 */
export const heightValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'La altura es requerida' };
  }
  
  const height = parseFloat(value);
  if (isNaN(height) || height < 50 || height > 300) {
    return { valid: false, message: 'Por favor ingresa una altura válida (50-300 cm)' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validador de peso para ValidatedInput
 */
export const weightValidator = (value) => {
  if (!value) {
    return { valid: false, message: 'El peso es requerido' };
  }
  
  const weight = parseFloat(value);
  if (isNaN(weight) || weight < 20 || weight > 300) {
    return { valid: false, message: 'Por favor ingresa un peso válido (20-300 kg)' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validador de calorías para ValidatedInput
 */
export const caloriesValidator = (value) => {
  if (!value) {
    return { valid: true, message: '' }; // Opcional
  }
  
  const calories = parseFloat(value);
  if (isNaN(calories) || calories < 500 || calories > 10000) {
    return { valid: false, message: 'Por favor ingresa un valor válido (500-10000 kcal)' };
  }
  
  return { valid: true, message: '' };
};

