import React, { useState } from 'react';
import { BellIcon, LockClosedIcon } from '../components/Icons';

interface ToggleProps {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

const SettingToggle: React.FC<ToggleProps> = ({ label, description, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-4">
        <div>
            <p className="font-medium text-gray-800">{label}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
            type="button"
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            onClick={() => onToggle(!enabled)}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    </div>
);


const SettingsPage: React.FC = () => {
    const [notifications, setNotifications] = useState({
        newOrders: true,
        orderUpdates: true,
        weeklySummary: false,
    });

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account and notification preferences.</p>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                    <BellIcon className="w-6 h-6 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                </div>
                <div className="divide-y">
                    <SettingToggle
                        label="New Order Emails"
                        description="Receive an email for every new order."
                        enabled={notifications.newOrders}
                        onToggle={() => handleToggle('newOrders')}
                    />
                    <SettingToggle
                        label="Order Status Updates"
                        description="Get notified when an order status changes."
                        enabled={notifications.orderUpdates}
                        onToggle={() => handleToggle('orderUpdates')}
                    />
                    <SettingToggle
                        label="Weekly Summary"
                        description="Receive a summary of your sales and performance every week."
                        enabled={notifications.weeklySummary}
                        onToggle={() => handleToggle('weeklySummary')}
                    />
                </div>
            </div>

             {/* Account Security */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                    <LockClosedIcon className="w-6 h-6 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-800">Account Security</h2>
                </div>
                <div>
                     <button className="px-4 py-2 bg-gray-200 text-sm font-semibold rounded-md hover:bg-gray-300">
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;