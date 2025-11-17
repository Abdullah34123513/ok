import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import type { Vendor, Restaurant, OperatingHours } from '@shared/types';
import { ClockIcon, PlusCircleIcon, StorefrontIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';

const defaultHours: OperatingHours = {
    monday: { isOpen: false, slots: [] },
    tuesday: { isOpen: false, slots: [] },
    wednesday: { isOpen: false, slots: [] },
    thursday: { isOpen: false, slots: [] },
    friday: { isOpen: false, slots: [] },
    saturday: { isOpen: false, slots: [] },
    sunday: { isOpen: false, slots: [] },
};

// Reusing the operating hours editor from the vendor app, but within this file for simplicity.
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

interface OperatingHoursEditorProps {
    hours: OperatingHours;
    setHours: React.Dispatch<React.SetStateAction<OperatingHours>>;
}

const OperatingHoursEditor: React.FC<OperatingHoursEditorProps> = ({ hours, setHours }) => {
    // Handlers for hours manipulation
    const handleToggleDay = (day: keyof OperatingHours) => {
        setHours(prev => {
            const dayState = prev[day];
            const newIsOpen = !dayState.isOpen;
            let newSlots = dayState.slots;
            if (newIsOpen && dayState.slots.length === 0) {
                newSlots = [{ open: '09:00', close: '17:00' }];
            }
            return { ...prev, [day]: { ...dayState, isOpen: newIsOpen, slots: newSlots } };
        });
    };

    const handleTimeChange = (day: keyof OperatingHours, slotIndex: number, type: 'open' | 'close', value: string) => {
        setHours(prev => {
            const newSlots = [...prev[day].slots];
            newSlots[slotIndex] = { ...newSlots[slotIndex], [type]: value };
            return { ...prev, [day]: { ...prev[day], slots: newSlots } };
        });
    };

    const addSlot = (day: keyof OperatingHours) => {
        setHours(prev => ({
            ...prev,
            [day]: { ...prev[day], slots: [...prev[day].slots, { open: '17:00', close: '22:00' }] }
        }));
    };

    const removeSlot = (day: keyof OperatingHours, slotIndex: number) => {
        setHours(prev => {
            const newSlots = prev[day].slots.filter((_, index) => index !== slotIndex);
            const newIsOpen = newSlots.length > 0 ? prev[day].isOpen : false;
            return { ...prev, [day]: { ...prev[day], slots: newSlots, isOpen: newIsOpen } };
        });
    };

    return (
        <div className="space-y-4">
            {daysOfWeek.map(day => (
                <div key={day} className="py-3 border-b last:border-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                        <div className="capitalize font-medium text-gray-800">{day}</div>
                        <div className="flex items-center space-x-3">
                            <button type="button" onClick={() => handleToggleDay(day)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${hours[day].isOpen ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${hours[day].isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className={`font-semibold ${hours[day].isOpen ? 'text-green-600' : 'text-gray-500'}`}>{hours[day].isOpen ? 'Open' : 'Closed'}</span>
                        </div>
                    </div>
                    {hours[day].isOpen && (
                        <div className="pl-4 mt-3 space-y-2">
                            {hours[day].slots.map((slot, index) => (
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
        </div>
    );
};


const VendorDetailPage: React.FC<{ vendorId: string }> = ({ vendorId }) => {
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [restaurant, setRestaurant] = useState<Partial<Restaurant>>({});
    const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const fetchData = useCallback(async () => {
        setError('');
        try {
            const data = await api.getVendorDetailsForModerator(vendorId);
            if (data) {
                setVendor(data.vendor);
                setRestaurant(data.restaurant);
                setOperatingHours(data.restaurant.operatingHours || defaultHours);
            } else {
                setError('Vendor not found.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load vendor details.');
        } finally {
            setIsLoading(false);
        }
    }, [vendorId]);

    useEffect(() => {
        setIsLoading(true);
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = async (newStatus: Vendor['status']) => {
        if (!vendor) return;
        setIsUpdatingStatus(true);
        try {
            const updatedVendor = await api.updateVendorStatus(vendor.id, newStatus!);
            setVendor(updatedVendor);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRestaurant(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveChanges = async () => {
        if (!vendor || !operatingHours) return;
        setIsSaving(true);
        setError('');
        try {
            await api.updateRestaurantDetails(vendor.restaurantId, {
                ...restaurant,
                operatingHours
            });
            alert('Changes saved successfully!');
            fetchData(); // Refetch to confirm
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-6 text-center">Loading vendor details...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    if (!vendor) return <div className="p-6 text-center">Vendor not found.</div>;

    const StatusActions = () => {
        if (isUpdatingStatus) return <p className="text-sm font-semibold text-gray-500">Updating...</p>;
        
        switch (vendor.status) {
            case 'pending':
                return (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleStatusUpdate('active')} className="flex items-center px-3 py-1.5 text-sm bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"><CheckCircleIcon className="w-4 h-4 mr-1"/>Approve</button>
                        <button onClick={() => handleStatusUpdate('disabled')} className="flex items-center px-3 py-1.5 text-sm bg-red-500 text-white font-semibold rounded-md hover:bg-red-600"><XCircleIcon className="w-4 h-4 mr-1"/>Reject</button>
                    </div>
                );
            case 'active':
                return <button onClick={() => handleStatusUpdate('disabled')} className="px-3 py-1.5 text-sm bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600">Disable</button>;
            case 'disabled':
                return <button onClick={() => handleStatusUpdate('active')} className="px-3 py-1.5 text-sm bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">Re-activate</button>;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Vendor: {vendor.name}</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <div>
                        <p className="text-sm text-gray-500">Current Status</p>
                        <p className={`font-bold text-lg capitalize ${vendor.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{vendor.status}</p>
                    </div>
                    <StatusActions />
                </div>

                <div className="space-y-6">
                    {/* Restaurant Profile Section */}
                    <details open className="group">
                        <summary className="text-xl font-bold cursor-pointer list-none flex justify-between items-center">
                            <div className="flex items-center space-x-2"><StorefrontIcon className="w-6 h-6"/><span>Restaurant Profile</span></div>
                            <span className="text-sm font-normal text-gray-500 group-open:hidden">Click to expand</span>
                        </summary>
                        <div className="mt-4 space-y-4 border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                                    <input type="text" name="name" value={restaurant.name || ''} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
                                    <input type="text" name="cuisine" value={restaurant.cuisine || ''} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input type="text" name="address" value={restaurant.address || ''} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                                </div>
                            </div>
                        </div>
                    </details>
                    
                    {/* Operating Hours Section */}
                    {operatingHours && (
                        <details className="group">
                            <summary className="text-xl font-bold cursor-pointer list-none flex justify-between items-center">
                                <div className="flex items-center space-x-2"><ClockIcon className="w-6 h-6"/><span>Operating Hours</span></div>
                                <span className="text-sm font-normal text-gray-500 group-open:hidden">Click to expand</span>
                            </summary>
                             <div className="mt-4 border-t pt-4">
                                <OperatingHoursEditor hours={operatingHours} setHours={setOperatingHours} />
                            </div>
                        </details>
                    )}
                </div>

                <div className="mt-6 border-t pt-4 flex justify-end">
                    <button onClick={handleSaveChanges} disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300">
                        {isSaving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorDetailPage;
