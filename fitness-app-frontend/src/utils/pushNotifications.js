/**
 * Utilidades para Push Notifications
 * Requiere configuración del backend con VAPID keys
 */

const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Solicitar permiso y suscribirse a push notifications
 */
export const requestPushNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return null;
  }

  if (Notification.permission === 'granted') {
    return await subscribeToPushNotifications();
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await subscribeToPushNotifications();
    }
  }

  return null;
};

/**
 * Suscribirse a push notifications
 */
const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker no disponible');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (!VAPID_PUBLIC_KEY) {
      console.warn('VAPID_PUBLIC_KEY no configurada');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    return subscription;
  } catch (error) {
    console.error('Error al suscribirse a push notifications:', error);
    return null;
  }
};

/**
 * Convertir VAPID key de base64 URL a Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Cancelar suscripción a push notifications
 */
export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    return false;
  }
};

/**
 * Verificar si el usuario está suscrito
 */
export const isSubscribedToPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Error al verificar suscripción:', error);
    return false;
  }
};
