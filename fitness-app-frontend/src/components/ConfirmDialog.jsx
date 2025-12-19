import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Componente ConfirmDialog reutilizable para confirmaciones elegantes
 * Reemplaza window.confirm() con diseño consistente y accesibilidad completa
 */
const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel,
  loading = false,
  showDontAskAgain = false,
  onDontAskAgainChange,
  children,
}) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleConfirm = () => {
    if (onDontAskAgainChange && dontAskAgain) {
      onDontAskAgainChange(true);
    }
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          confirmButton: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white',
        };
      case 'warning':
        return {
          icon: 'text-yellow-600 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white',
        };
      default:
        return {
          icon: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Dialog.Overlay 
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                  onClick={handleCancel}
                />
              </motion.div>
              <Dialog.Content
                className="fixed top-0 md:top-1/2 left-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-t-3xl md:rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-6 md:p-8 max-w-md w-full md:w-[calc(100%-2rem)] md:mx-4 max-h-[90vh] md:max-h-[90vh] h-[90vh] md:h-auto overflow-y-auto z-50 focus:outline-none"
                onEscapeKeyDown={loading ? (e) => e.preventDefault() : undefined}
                onPointerDownOutside={loading ? (e) => e.preventDefault() : undefined}
                onInteractOutside={loading ? (e) => e.preventDefault() : undefined}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center mb-6 mx-auto border border-gray-200/50 dark:border-gray-700/50`}>
                    <AlertTriangle className={`w-8 h-8 ${styles.icon}`} />
                  </div>

                  {/* Title */}
                  <Dialog.Title className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                    {title}
                  </Dialog.Title>

                  {/* Description */}
                  {description && (
                    <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                      {description}
                    </Dialog.Description>
                  )}

                  {/* Custom content */}
                  {children && (
                    <div className="mb-6">
                      {children}
                    </div>
                  )}

                  {/* Don't ask again checkbox */}
                  {showDontAskAgain && (
                    <div className="mb-6 flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        id="dont-ask-again"
                        checked={dontAskAgain}
                        onChange={(e) => setDontAskAgain(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:checked:bg-blue-600"
                      />
                      <label
                        htmlFor="dont-ask-again"
                        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                      >
                        No volver a preguntar
                      </label>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Dialog.Close asChild>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={cancelLabel}
                      >
                        {cancelLabel}
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className={`flex-1 px-4 py-3 ${styles.confirmButton} rounded-2xl font-semibold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                      aria-label={confirmLabel}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Procesando...
                        </>
                      ) : (
                        confirmLabel
                      )}
                    </button>
                  </div>

                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                      aria-label="Cerrar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;

