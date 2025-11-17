import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import type { Vendor, Restaurant } from '@shared/types';
import { StorefrontIcon, CheckCircleIcon, XCircleIcon, ActAsIcon } from '../components/Icons';

const VendorDetailPage: React.FC<{ vendorId: string }> = ({ vendorId }) => {
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [restaurant, setRestaurant] = useState<Partial<Restaurant>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const fetchData = useCallback(async () => {
        setError('');
        try {
            const data = await api.getVendorDetailsForModerator(vendorId);
            if (data) {
                setVendor(data.vendor);
                setRestaurant(data.restaurant);
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

    const handleActAsVendor = () => {
        if (!vendor) return;
        if (window.confirm(`You are about to act as ${vendor.name}. You will be redirected to their dashboard. Continue?`)) {
            const MODERATOR_STORAGE_KEY = 'foodie-find-moderator-user';
            const VENDOR_STORAGE_KEY = 'foodie-find-vendor-user';
            const MASQUERADE_SESSION_KEY = 'foodie-find-original-moderator';

            const moderatorUser = localStorage.getItem(MODERATOR_STORAGE_KEY);
            if (moderatorUser) {
                sessionStorage.setItem(MASQUERADE_SESSION_KEY, moderatorUser);
                localStorage.removeItem(MODERATOR_STORAGE_KEY);

                localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendor));

                window.location.href = '/vendor/';
            } else {
                alert('Could not establish moderator session. Please log in again.');
            }
        }
    };

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Vendor</h1>
                    <p className="text-gray-600">{vendor.name} ({vendor.email})</p>
                </div>
                <button
                    onClick={handleActAsVendor}
                    className="flex items-center px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-transform transform hover:scale-105"
                >
                    <ActAsIcon className="w-5 h-5 mr-2" />
                    Act as Vendor
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                {/* Status Management */}
                <div className="pb-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Status Management</h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Current Status</p>
                            <p className={`font-bold text-lg capitalize ${vendor.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{vendor.status}</p>
                        </div>
                        <StatusActions />
                    </div>
                </div>

                {/* Restaurant Info */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><StorefrontIcon className="w-5 h-5 mr-2" />Restaurant Information</h2>
                    <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-md">
                        <p><strong>Name:</strong> {restaurant.name || 'N/A'}</p>
                        <p><strong>Cuisine:</strong> {restaurant.cuisine || 'N/A'}</p>
                        <p><strong>Address:</strong> {restaurant.address || 'N/A'}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                        To manage the restaurant's profile, menu, orders, or operating hours, please use the "Act as Vendor" button to access their dashboard directly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorDetailPage;