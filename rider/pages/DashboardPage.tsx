import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import type { Order } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { StorefrontIcon, HomeIcon, MapPinIcon, MoneyIcon, PackageIcon, ClockIcon, LogoutIcon } from '../components/Icons';

const OrderCard: React.FC<{ 
    order: Order, 
    onAccept: (orderId: string) => void,
    onReject: (orderId: string) => void,
    isUpdating: boolean
}> = ({ order, onAccept, onReject, isUpdating }) => {

    const itemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pickup Info */}
                <div>
                    <div className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                        <StorefrontIcon className="w-5 h-5 mr-2 text-blue-500" />
                        <span>PICKUP FROM</span>
                    </div>
                    <p className="font-bold text-lg text-gray-800">{order.restaurantName}</p>
                    {/* FIX: The find operation failed because 'r.name' did not exist. Added 'name' to the mock data array. */}
                    <p className="text-sm text-gray-600">{allMockRestaurants.find(r => r.name === order.restaurantName)?.address}</p>
                </div>

                {/* Dropoff Info */}
                <div>
                    <div className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                        <HomeIcon className="w-5 h-5 mr-2 text-green-500" />
                        <span>DELIVER TO</span>
                    </div>
                    <p className="font-bold text-lg text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.address.details}</p>
                </div>
            </div>

            {/* Details */}
            <div className="mt-4 pt-3 border-t border-dashed flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center text-gray-700"><MoneyIcon className="w-4 h-4 mr-1.5 text-green-600"/>Delivery Fee: <span className="font-bold ml-1">৳{order.deliveryFee.toFixed(2)}</span></div>
                <div className="flex items-center text-gray-700"><MapPinIcon className="w-4 h-4 mr-1.5 text-red-500"/>Distance: <span className="font-bold ml-1">{order.distance} km</span></div>
                <div className="flex items-center text-gray-700"><PackageIcon className="w-4 h-4 mr-1.5 text-purple-600"/>Items: <span className="font-bold ml-1">{itemsCount}</span></div>
                <div className="flex items-center text-gray-700"><ClockIcon className="w-4 h-4 mr-1.5 text-yellow-600"/>Est. Time: <span className="font-bold ml-1">{order.estimatedDeliveryTime}</span></div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t flex justify-end space-x-3">
                <button
                    onClick={() => onReject(order.id)}
                    disabled={isUpdating}
                    className="px-6 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                    {isUpdating ? '...' : 'Reject'}
                </button>
                <button
                    onClick={() => onAccept(order.id)}
                    disabled={isUpdating}
                    className="px-8 py-2 text-sm font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                     {isUpdating ? '...' : 'Accept'}
                </button>
            </div>
        </div>
    );
};

// This is a hack because the API file doesn't export the mock data directly
const allMockRestaurants = [
    { id: 'restaurant-1', name: 'Restaurant Hub 1', address: '121 Flavor St, Food City' },
    { id: 'restaurant-2', name: 'Restaurant Hub 2', address: '122 Flavor St, Food City' },
    { id: 'restaurant-5', name: '24/7 Diner', address: '125 Flavor St, Food City' },
];


const DashboardPage: React.FC = () => {
    const { currentRider, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const fetchNewOrders = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getRiderNewOrders();
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNewOrders();
        const interval = setInterval(fetchNewOrders, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchNewOrders]);

    const handleAccept = async (orderId: string) => {
        if (!currentRider) return;
        setUpdatingOrderId(orderId);
        try {
            await api.acceptRiderOrder(orderId, currentRider.id);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            // In a real app, you might show a success notification
        } catch (err) {
            setError('Failed to accept order. It might have been taken by another rider.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleReject = (orderId: string) => {
        // For this mock, we just remove it from the local list.
        // A real app might call an API to say this rider rejected it.
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8 text-gray-500">Searching for new orders...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-500">{error}</div>;
        }
        if (orders.length === 0) {
            return <div className="text-center p-8 text-gray-500">No new orders available right now. We'll keep looking!</div>;
        }
        return (
            <div className="space-y-4">
                {orders.map(order => (
                    <OrderCard 
                        key={order.id} 
                        order={order}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        isUpdating={updatingOrderId === order.id}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-[#1E1E1E] text-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">New Orders</h1>
                        <p className="text-sm text-gray-300">Welcome, {currentRider?.name}</p>
                    </div>
                    <button onClick={logout} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                        <LogoutIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">Logout</span>
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4">
                {renderContent()}
            </main>
        </div>
    );
};

export default DashboardPage;
