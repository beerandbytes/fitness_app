import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Componente de input con validación en tiempo real
 * Muestra feedback visual inmediato mientras el usuario escribe
 */
const ValidatedInput = ({
  label,
  type = 'text',
  value,
  onChange,
  onValidation,
  validator,
  errorMessage,
  successMessage,
  placeholder,
  required = false,
  className = '',
  ...props
}) => {
  const [isValid, setIsValid] = useState(null);
  const [isTouched, setIsTouched] = useState(false);
  const [message, setMessage] = useState('');
  const lastValidatedValueRef = useRef(value);
  const lastValidationResultRef = useRef({ valid: null, message: '' });
  const validationTimeoutRef = useRef(null);
  const isProcessingRef = useRef(false);
  // Usar ref para almacenar la función validator y evitar recreaciones innecesarias
  const validatorRef = useRef(validator);
  // Usar ref para almacenar onValidation callback y evitar recreaciones innecesarias
  const onValidationRef = useRef(onValidation);
  // Usar ref para almacenar isValid y evitar dependencias innecesarias
  const isValidRef = useRef(isValid);

  // Actualizar los refs cuando cambien
  useEffect(() => {
    validatorRef.current = validator;
    onValidationRef.current = onValidation;
    isValidRef.current = isValid;
  }, [validator, onValidation, isValid]);

  useEffect(() => {


    // Prevenir ejecución si ya se está procesando
    if (isProcessingRef.current) {
      return;
    }

    // Prevenir ejecución si el valor no cambió realmente Y el resultado de validación es el mismo
    // Usar ref para evitar dependencia de isValid
    if (lastValidatedValueRef.current === value && isValidRef.current === lastValidationResultRef.current.valid) {
      return;
    }

    isProcessingRef.current = true;

    // Limpiar timeout anterior si existe
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
    }

    // Actualizar ref inmediatamente para prevenir múltiples ejecuciones del mismo valor
    lastValidatedValueRef.current = value;

    if (!isTouched || !value) {
      // Usar debounce más largo para evitar loops en Docker (300ms en lugar de 0ms)
      validationTimeoutRef.current = setTimeout(() => {
        setIsValid(null);
        setMessage('');
        lastValidationResultRef.current = { valid: null, message: '' };
        if (onValidationRef.current) {
          onValidationRef.current(null, '');
        }
        isProcessingRef.current = false;

      }, 300);
      return;
    }

    // Usar validatorRef.current en lugar de validator directamente para evitar dependencias inestables
    const currentValidator = validatorRef.current;
    if (currentValidator) {
      // Usar debounce también para validación cuando hay valor (150ms)
      validationTimeoutRef.current = setTimeout(() => {
        const result = currentValidator(value);
        setIsValid(result.valid);
        setMessage(result.message || '');
        lastValidationResultRef.current = { valid: result.valid, message: result.message || '' };
        isProcessingRef.current = false;

        if (onValidationRef.current) {
          onValidationRef.current(result.valid, result.message);
        }
      }, 150);
    } else {
      isProcessingRef.current = false;
    }

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
        validationTimeoutRef.current = null;
      }
    };
    // Usar refs para validator y onValidation para evitar dependencias inestables
    // isValid se maneja mediante ref para evitar dependencia circular
  }, [value, isTouched]);

  const handleBlur = () => {
    setIsTouched(true);
  };

  const handleChange = (e) => {
    // We only set touched on blur to avoid premature validation messages
    // while the user is still typing or on initial autofill.
    onChange(e);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-10 ${isValid === true
            ? 'border-green-500 focus:ring-green-500/20 focus:border-green-600 dark:border-green-500 dark:focus:border-green-400'
            : isValid === false
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600 dark:border-red-500 dark:focus:border-red-400'
              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400'
            }`}
          {...props}
        />

        {isTouched && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid === true ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : isValid === false ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
        )}
      </div>

      {isTouched && message && (
        <p
          className={`text-sm flex items-center gap-1 ${isValid === true
            ? 'text-green-600 dark:text-green-400'
            : isValid === false
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
            }`}
        >
          {isValid === false && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {message}
        </p>
      )}

      {isTouched && !message && isValid === true && successMessage && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMessage}
        </p>
      )}

      {errorMessage && isValid === false && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;

