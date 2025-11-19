
import { useState, useEffect, useCallback } from 'react';

export const useBrowserNotification = () => {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'denied'
    );

    useEffect(() => {
        if (typeof Notification !== 'undefined') {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (typeof Notification !== 'undefined') {
            try {
                const result = await Notification.requestPermission();
                setPermission(result);
                return result;
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                return 'denied';
            }
        }
        return 'denied';
    }, []);

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (permission === 'granted') {
            try {
               new Notification(title, {
                   icon: '/vite.svg', // Fallback to default icon
                   ...options
               });
            } catch (e) {
                console.error("Notification error", e);
            }
        }
    }, [permission]);

    return { permission, requestPermission, sendNotification };
};
