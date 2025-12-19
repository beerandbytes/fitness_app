import React from 'react';

/**
 * Componente para regiones aria-live que anuncian cambios dinámicos
 * a los lectores de pantalla
 */
const AriaLiveRegion = ({ 
    level = 'polite', // 'polite' o 'assertive'
    children,
    id = 'aria-live-region'
}) => {
    return (
        <div
            id={id}
            role="status"
            aria-live={level}
            aria-atomic="true"
            className="sr-only"
        >
            {children}
        </div>
    );
};

/**
 * Hook para anunciar mensajes a lectores de pantalla
 */
export const useAriaAnnouncer = () => {
    const [announcement, setAnnouncement] = React.useState('');

    const announce = React.useCallback((message, level = 'polite') => {
        setAnnouncement('');
        // Forzar re-render para que el lector de pantalla detecte el cambio
        setTimeout(() => {
            setAnnouncement(message);
        }, 100);
    }, []);

    const Announcer = React.useCallback(() => (
        <AriaLiveRegion level="polite">
            {announcement}
        </AriaLiveRegion>
    ), [announcement]);

    return { announce, Announcer };
};

export default AriaLiveRegion;

