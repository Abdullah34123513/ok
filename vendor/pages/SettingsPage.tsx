import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import { BellIcon, LockClosedIcon, ClockIcon, PlusCircleIcon, TrashIcon } from '../components/Icons';
import type { OperatingHours, TimeSlot } from '@shared/types';

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

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const defaultHours: OperatingHours = {
    monday: { isOpen: false, slots: [] },
    tuesday: { isOpen: false, slots: [] },
    wednesday: { isOpen: false, slots: [] },
    thursday: { isOpen: false, slots: [] },
    friday: { isOpen: false, slots: [] },
    saturday: { isOpen: false, slots: [] },
    sunday: { isOpen: false, slots: [] },
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
        setOperatingHours(prev => {
            const dayState = prev[day];
            const newIsOpen = !dayState.isOpen;
            let newSlots = dayState.slots;
            if (newIsOpen && dayState.slots.length === 0) {
                newSlots = [{ open: '09:00', close: '17:00' }];
            }
            return {
                ...prev,
                [day]: {
                    ...dayState,
                    isOpen: newIsOpen,
                    slots: newSlots,
                },
            };
        });
    };

    const handleTimeChange = (day: keyof OperatingHours, slotIndex: number, type: 'open' | 'close', value: string) => {
        setOperatingHours(prev => {
            const newSlots = [...prev[day].slots];
            newSlots[slotIndex] = { ...newSlots[slotIndex], [type]: value };
            return {
                ...prev,
                [day]: {
                    ...prev[day],
                    slots: newSlots,
                },
            };
        });
    };
    
    const addSlot = (day: keyof OperatingHours) => {
        setOperatingHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                slots: [...prev[day].slots, { open: '17:00', close: '22:00' }],
            },
        }));
    };

    const removeSlot = (day: keyof OperatingHours, slotIndex: number) => {
        setOperatingHours(prev => {
            const newSlots = prev[day].slots.filter((_, index) => index !== slotIndex);
            return {
                ...prev,
                [day]: {
                    ...prev[day],
                    slots: newSlots,
                    isOpen: newSlots.length > 0,
                },
            };
        });
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
                            <div key={day} className="py-3 border-b last:border-0">
                                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
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
                                </div>
                                {operatingHours[day].isOpen && (
                                    <div className="pl-4 mt-3 space-y-2">
                                        {operatingHours[day].slots.map((slot, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input type="time" value={slot.open} onChange={e => handleTimeChange(day, index, 'open', e.target.value)} className="p-1 border rounded text-sm w-full max-w-[120px]"/>
                                                <span className="text-gray-500">to</span>
                                                <input type="time" value={slot.close} onChange={e => handleTimeChange(day, index, 'close', e.target.value)} className="p-1 border rounded text-sm w-full max-w-[120px]"/>
                                                <button onClick={() => removeSlot(day, index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addSlot(day)} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"><PlusCircleIcon className="w-5 h-5 mr-1"/>Add time slot</button>
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