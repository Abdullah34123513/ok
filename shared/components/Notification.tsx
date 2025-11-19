
import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const Notification: React.FC = () => {
    const { notification, hideNotification } = useNotification();

    if (!notification.isVisible) {
        return null;
    }

    const baseStyle = "fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-white transition-transform transform-gpu";
    const typeStyle = notification.type === 'error' ? 'bg-red-500' : 'bg-green-500';
    const animationStyle = notification.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';

    return (
        <div 
            className={`${baseStyle} ${typeStyle} ${animationStyle} animate-fade-in-up`}
            role="alert"
        >
            <div className="flex items-center justify-between">
                <span className="font-medium">{notification.message}</span>
                <button onClick={hideNotification} className="ml-4 font-bold text-lg opacity-80 hover:opacity-100 transition-opacity">&times;</button>
            </div>
        </div>
    );
};

export default Notification;
