import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!isTouched || !value) {
      // Usar setTimeout para evitar setState síncrono en efecto
      setTimeout(() => {
        setIsValid(null);
        setMessage('');
        if (onValidation) {
          onValidation(null, '');
        }
      }, 0);
      return;
    }

    if (validator) {
      const result = validator(value);
      setIsValid(result.valid);
      setMessage(result.message || '');
      
      if (onValidation) {
        onValidation(result.valid, result.message);
      }
    }
    // onValidation puede cambiar en cada render, pero es una función callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validator, isTouched]);

  const handleBlur = () => {
    setIsTouched(true);
  };

  const handleChange = (e) => {
    setIsTouched(true);
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
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-10 ${
            isValid === true
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
          className={`text-sm flex items-center gap-1 ${
            isValid === true
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

