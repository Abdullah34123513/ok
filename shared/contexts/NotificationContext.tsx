
import React, { createContext, useState, useContext, useCallback } from 'react';

type NotificationType = 'success' | 'error';

interface NotificationState {
    message: string;
    type: NotificationType;
    isVisible: boolean;
}

interface NotificationContextType {
    notification: NotificationState;
    showNotification: (message: string, type: NotificationType) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<NotificationState>({
        message: '',
        type: 'success',
        isVisible: false,
    });
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    const hideNotification = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setNotification((prev) => ({ ...prev, isVisible: false }));
    }, [timeoutId]);

    const showNotification = useCallback((message: string, type: NotificationType) => {
        // Hide any existing notification first
        hideNotification();

        // Use a timeout to ensure the state update is processed for re-triggering animations
        setTimeout(() => {
            setNotification({ message, type, isVisible: true });
            const id = setTimeout(() => {
                hideNotification();
            }, 5000);
            setTimeoutId(id);
        }, 50);

    }, [hideNotification]);

    const value = {
        notification,
        showNotification,
        hideNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
