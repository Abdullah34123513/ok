import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import { BellIcon, LockClosedIcon, ClockIcon } from '../components/Icons';
import type { OperatingHours } from '@shared/types';

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

const daysOfWeek: (keyof OperatingHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// FIX: Replaced reduce with an explicit object literal to avoid potential type inference issues with the accumulator.
const defaultHours: OperatingHours = {
    monday: { isOpen: false, open: '09:00', close: '17:00' },
    tuesday: { isOpen: false, open: '09:00', close: '17:00' },
    wednesday: { isOpen: false, open: '09:00', close: '17:00' },
    thursday: { isOpen: false, open: '09:00', close: '17:00' },
    friday: { isOpen: false, open: '09:00', close: '17:00' },
    saturday: { isOpen: false, open: '09:00', close: '17:00' },
    sunday: { isOpen: false, open: '09:00', close: '17:00' },
};


const SettingsPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const [notifications, setNotifications] = useState({
        newOrders: true,
        orderUpdates: true,
        weeklySummary: false,
    });
    const [operatingHours, setOperatingHours] = useState<OperatingHours>(defaultHours);
    const [isLoadingHours, setIsLoadingHours] = useState(true);
    const [isSavingHours, setIsSavingHours] = useState(false);

    useEffect(() => {
        if (!currentVendor) return;
        setIsLoadingHours(true);
        api.getRestaurantDetails(currentVendor.restaurantId)
            .then(data => {
                if (data?.operatingHours) {
                    setOperatingHours(data.operatingHours);
                }
            })
            .finally(() => setIsLoadingHours(false));
    }, [currentVendor]);

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleToggleDay = (day: keyof OperatingHours) => {
        setOperatingHours(prev => ({
            ...prev,
            [day]: { ...prev[day], isOpen: !prev[day].isOpen }
        }));
    };
    
    const handleTimeChange = (day: keyof OperatingHours, type: 'open' | 'close', value: string) => {
        setOperatingHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [type]: value }
        }));
    };

    const handleSaveHours = async () => {
        if (!currentVendor) return;
        setIsSavingHours(true);
        try {
            await api.updateRestaurantDetails(currentVendor.restaurantId, { operatingHours });
            alert('Operating hours updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save operating hours.');
        } finally {
            setIsSavingHours(false);
        }
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

            {/* Operating Hours Settings */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                    <ClockIcon className="w-6 h-6 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-800">Operating Hours</h2>
                </div>
                {isLoadingHours ? (
                    <div className="text-center py-4">Loading hours...</div>
                ) : (
                    <div className="space-y-4">
                        {daysOfWeek.map(day => (
                            <div key={day} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 py-3 border-b last:border-0">
                                <div className="capitalize font-medium text-gray-800">{day}</div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleDay(day)}
                                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                                            operatingHours[day].isOpen ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                                operatingHours[day].isOpen ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <span className={`font-semibold ${operatingHours[day].isOpen ? 'text-green-600' : 'text-gray-500'}`}>
                                        {operatingHours[day].isOpen ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                                {operatingHours[day].isOpen && (
                                    <div className="flex items-center gap-2">
                                        <input type="time" value={operatingHours[day].open} onChange={e => handleTimeChange(day, 'open', e.target.value)} className="p-1 border rounded text-sm w-full"/>
                                        <span className="text-gray-500">to</span>
                                        <input type="time" value={operatingHours[day].close} onChange={e => handleTimeChange(day, 'close', e.target.value)} className="p-1 border rounded text-sm w-full"/>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleSaveHours}
                                disabled={isSavingHours}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                            >
                                {isSavingHours ? 'Saving...' : 'Save Hours'}
                            </button>
                        </div>
                    </div>
                )}
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
