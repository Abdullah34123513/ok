import { useEffect } from 'react';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
  Channel,
} from '@capacitor/push-notifications';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export const usePushNotifications = () => {
  const { showNotification } = useNotification();
  const { currentVendor } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !currentVendor) {
      return;
    }

    const handles: PluginListenerHandle[] = [];

    const initPush = async () => {
      try {
        const createNotificationChannel = async () => {
          // On Android, we must create a channel for notifications to work.
          const channel: Channel = {
            id: 'new-orders-channel',
            name: 'New Orders',
            description: 'Notifications for new customer orders.',
            importance: 5, // Max importance
            visibility: 1, // Public
            vibration: true,
          };
          await PushNotifications.createChannel(channel);
        };
        
        const registerDevice = async () => {
          let permStatus = await PushNotifications.checkPermissions();

          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }
          
          if (permStatus.receive !== 'granted') {
            console.warn('Push notification permission was denied.');
            return;
          }
          
          // Must create a channel on Android before registering
          if (Capacitor.getPlatform() === 'android') {
            await createNotificationChannel();
          }

          // Register the device with APNS/FCM.
          await PushNotifications.register();
        };

        // Add listeners and store their handles
        const registrationHandle = await PushNotifications.addListener('registration', (token: Token) => {
          console.info('Push registration success, token:', token.value);
        });
        handles.push(registrationHandle);

        const registrationErrorHandle = await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration:', error);
          showNotification('Could not register for push notifications.', 'error');
        });
        handles.push(registrationErrorHandle);

        const receivedHandle = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push received:', notification);
            const message = notification.body || 'You have a new notification.';
            showNotification(message, 'info');

            if (notification.data?.type === 'new_order') {
              document.dispatchEvent(new CustomEvent('new-order-notification'));
            }
          },
        );
        handles.push(receivedHandle);

        const performedHandle = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification: ActionPerformed) => {
            console.log('Push action performed:', notification);
            if (notification.notification.data?.type === 'new_order') {
              window.location.hash = '#/dashboard';
            }
          },
        );
        handles.push(performedHandle);
        
        // After setting up listeners, try to register the device.
        await registerDevice();

      } catch (e) {
        console.error('Error initializing push notifications', e);
        showNotification('Failed to set up notifications.', 'error');
      }
    };

    initPush();

    // Cleanup function
    return () => {
      console.log('Removing push notification listeners...');
      handles.forEach(handle => handle.remove());
    };
  }, [currentVendor, showNotification]);
};
