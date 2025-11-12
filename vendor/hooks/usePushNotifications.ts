import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export const usePushNotifications = () => {
  const { showNotification } = useNotification();
  const { currentVendor } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      // Don't run on web
      return;
    }

    if (!currentVendor) {
      // User is not logged in, clear listeners and don't register
      PushNotifications.removeAllListeners().catch(err => console.error("Could not remove listeners on logout", err));
      return;
    }

    const initPush = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        showNotification('Push notification permission was denied.', 'error');
        console.error('User denied push notifications permission.');
        return;
      }

      await PushNotifications.register();
    };

    initPush();

    // On registration success, receive the token
    const regListener = PushNotifications.addListener('registration', (token: Token) => {
      console.info('Push registration success, token:', token.value);
      // In a real app, you would send this token to your server and associate it with the current vendor.
    });

    // On registration error
    const regErrorListener = PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration:', error);
      showNotification('Could not register for push notifications.', 'error');
    });

    // Show a notification when the app is in the foreground
    const pushListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received:', notification);
        const message = notification.body || 'You have a new notification.';
        showNotification(message, 'info');

        // If it's a new order, dispatch an event to refresh the dashboard
        if (notification.data?.type === 'new_order') {
          document.dispatchEvent(new CustomEvent('new-order-notification'));
        }
      },
    );

    // Method called when tapping on a notification
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed:', notification);
        // Example: navigate to dashboard on tap
        if (notification.notification.data?.type === 'new_order') {
          window.location.hash = '#/dashboard';
        }
      },
    );

    return () => {
      // Clean up listeners
      regListener.remove();
      regErrorListener.remove();
      pushListener.remove();
      actionListener.remove();
    };
  }, [currentVendor, showNotification]);
};
