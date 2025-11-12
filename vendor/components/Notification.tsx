import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const Notification: React.FC = () => {
    const { notification, hideNotification } = useNotification();

    if (!notification.isVisible) {
        return null;
    }

    const baseStyle = "fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-white transition-transform transform-gpu max-w-sm";
    
    let typeStyle = '';
    switch (notification.type) {
        case 'error':
            typeStyle = 'bg-red-500';
            break;
        case 'success':
            typeStyle = 'bg-green-500';
            break;
        case 'info':
            typeStyle = 'bg-blue-500';
            break;
        default:
            typeStyle = 'bg-gray-800';
    }

    const animationStyle = notification.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';

    return (
        <div 
            className={`${baseStyle} ${typeStyle} ${animationStyle} animate-fade-in-up`}
            role="alert"
        >
            <div className="flex items-center justify-between">
                <span>{notification.message}</span>
                <button onClick={hideNotification} className="ml-4 font-bold text-lg leading-none">&times;</button>
            </div>
        </div>
    );
};

export default Notification;
