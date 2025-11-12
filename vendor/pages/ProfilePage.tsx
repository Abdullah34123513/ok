import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { Restaurant } from '@shared/types';
import { StorefrontIcon } from '../components/Icons';

const ProfilePageSkeleton = () => (
    <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="md:col-span-2 space-y-4">
                     <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                     <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
            <div className="mt-6 border-t pt-4">
                <div className="h-12 bg-gray-200 rounded w-32"></div>
            </div>
        </div>
    </div>
);

const ProfilePage: React.FC = () => {
    const { currentVendor, logout } = useAuth();
    const [restaurant, setRestaurant] = useState<Partial<Restaurant>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentVendor) return;
        setIsLoading(true);
        api.getRestaurantDetails(currentVendor.restaurantId)
            .then(data => {
                if (data) setRestaurant(data);
            })
            .catch(() => setError('Failed to load restaurant data.'))
            .finally(() => setIsLoading(false));
    }, [currentVendor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRestaurant(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentVendor) return;
        setIsSaving(true);
        setError('');
        try {
            await api.updateRestaurantDetails(currentVendor.restaurantId, restaurant);
            alert('Profile updated successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return <ProfilePageSkeleton />;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3">
                <StorefrontIcon className="w-8 h-8 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-800">Restaurant Profile</h1>
            </div>
            
            <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-md">
                {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                        <input type="text" name="name" id="name" value={restaurant.name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                     <div>
                        <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700">Cuisine Type</label>
                        <input type="text" name="cuisine" id="cuisine" value={restaurant.cuisine || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" name="address" id="address" value={restaurant.address || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                </div>
                <div className="mt-6 border-t pt-4">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800">Account Actions</h2>
                <p className="text-gray-600 mt-1 mb-4">Log out of your vendor account.</p>
                <button onClick={logout} className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
