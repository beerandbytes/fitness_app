import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Keyboard, X } from 'lucide-react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

/**
 * Modal que muestra los atajos de teclado disponibles
 */
const KeyboardShortcutsModal = ({ open, onOpenChange }) => {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Búsqueda global (próximamente)' },
    { keys: ['Esc'], description: 'Cerrar modales/diálogos' },
    { keys: ['Tab'], description: 'Navegar entre elementos' },
    { keys: ['Enter'], description: 'Confirmar acción' },
    { keys: ['Arrow Up/Down'], description: 'Navegar listas' },
  ];

  // Atajo para abrir este modal: Ctrl+K o Cmd+K
  useKeyboardShortcuts({
    'ctrl+k': () => onOpenChange(true),
    'cmd+k': () => onOpenChange(true),
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-0 md:top-1/2 left-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-t-3xl md:rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-6 md:p-8 max-w-2xl w-full md:w-[calc(100%-2rem)] md:mx-4 max-h-[90vh] md:max-h-[90vh] h-[90vh] md:h-auto overflow-y-auto z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Dialog.Title className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Atajos de Teclado
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Atajos disponibles en la aplicación
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                <div className="flex items-center gap-2">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-gray-400">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Presiona <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd> para cerrar
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default KeyboardShortcutsModal;

