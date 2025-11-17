import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Vendor } from '@shared/types';
import { ActAsIcon } from '../components/Icons';

type VendorWithRestaurant = Vendor & { restaurantName: string };

const VendorStatusBadge: React.FC<{ status: Vendor['status'] }> = ({ status }) => {
    const statusStyles: Record<NonNullable<Vendor['status']>, string> = {
        'active': 'bg-green-100 text-green-800',
        'disabled': 'bg-gray-100 text-gray-800',
        'pending': 'bg-yellow-100 text-yellow-800',
    };
    const statusText = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status || 'disabled']}`}>
            {statusText}
        </span>
    );
};


const VendorManagementPage: React.FC = () => {
    const [vendors, setVendors] = useState<VendorWithRestaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            setIsLoading(true);
            setError('');
            try {
                const data = await api.getAllVendors();
                setVendors(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load vendors.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const handleActAsVendor = (vendor: VendorWithRestaurant) => {
        if (window.confirm(`You are about to act as ${vendor.name}. You will be redirected to their dashboard. Continue?`)) {
            const MODERATOR_STORAGE_KEY = 'foodie-find-moderator-user';
            const VENDOR_STORAGE_KEY = 'foodie-find-vendor-user';

            const moderatorUser = localStorage.getItem(MODERATOR_STORAGE_KEY);
            if (moderatorUser) {
                sessionStorage.setItem('foodie-find-original-moderator', moderatorUser);
                localStorage.removeItem(MODERATOR_STORAGE_KEY);
                
                const vendorAuthData: Vendor = {
                    id: vendor.id,
                    restaurantId: vendor.restaurantId,
                    name: vendor.name,
                    email: vendor.email,
                    status: vendor.status,
                };

                localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendorAuthData));

                window.location.href = '/vendor/';
            } else {
                alert('Could not establish moderator session. Please log in again.');
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <p className="p-6 text-center text-gray-500">Loading vendors...</p>
                ) : error ? (
                    <p className="p-6 text-center text-red-500">{error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 font-semibold">Vendor Name</th>
                                    <th className="p-4 font-semibold">Restaurant</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map(vendor => (
                                    <tr key={vendor.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-4 font-medium whitespace-nowrap">{vendor.name}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{vendor.restaurantName}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{vendor.email}</td>
                                        <td className="p-4">
                                            <VendorStatusBadge status={vendor.status} />
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-right">
                                            <a href={`#/vendorDetail/${vendor.id}`} className="px-3 py-1.5 text-sm font-semibold text-blue-600 rounded-md hover:bg-blue-100 transition">
                                                Manage
                                            </a>
                                            <button onClick={() => handleActAsVendor(vendor)} className="ml-2 inline-flex items-center px-3 py-1.5 text-sm font-semibold text-orange-600 rounded-md hover:bg-orange-100 transition">
                                                <ActAsIcon className="w-4 h-4 mr-1.5" />
                                                Act as
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorManagementPage;