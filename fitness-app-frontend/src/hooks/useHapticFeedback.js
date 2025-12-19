/**
 * Hook para feedback háptico en dispositivos móviles
 */
export const useHapticFeedback = () => {
    const vibrate = (pattern = [10]) => {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (error) {
                // Fallar silenciosamente si no está disponible
            }
        }
    };

    const lightImpact = () => vibrate([10]);
    const mediumImpact = () => vibrate([20]);
    const heavyImpact = () => vibrate([30]);
    const success = () => vibrate([10, 50, 10, 50, 20]);
    const error = () => vibrate([50, 100, 50, 100, 50]);

    return {
        vibrate,
        lightImpact,
        mediumImpact,
        heavyImpact,
        success,
        error,
    };
};

export default useHapticFeedback;

