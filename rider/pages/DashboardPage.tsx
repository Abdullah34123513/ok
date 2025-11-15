
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '@shared/api';
import type { Order, LocationPoint } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { StorefrontIcon, HomeIcon, MapPinIcon, MoneyIcon, PackageIcon, ClockIcon, LogoutIcon } from '../components/Icons';

const NewOrderCard: React.FC<{ 
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

const ActiveOrderJourney: React.FC<{
    order: Order,
    onMarkAsPickedUp: (orderId: string) => void,
    onMarkAsDelivered: (orderId: string) => void,
    isUpdating: boolean
}> = ({ order, onMarkAsPickedUp, onMarkAsDelivered, isUpdating }) => {
    
    const handleNavigation = (location?: LocationPoint) => {
        if (location) {
            // Opens Google Maps in a new tab on web, or the maps app on mobile.
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
        }
    };

    const isPickupStage = order.status === 'Preparing';
    const destinationLocation = isPickupStage ? order.restaurantLocation : order.deliveryLocation;

    return (
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 animate-fade-in-up">
            <div className="flex justify-between items-center pb-3 border-b">
                <h3 className="font-bold text-lg">Order #{order.id.split('-')[1]}</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isPickupStage ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>
                    {isPickupStage ? 'Going to Pickup' : 'Out for Delivery'}
                </span>
            </div>
            
            <div className="py-4">
                {isPickupStage ? (
                    // Pickup Stage
                    <div>
                        <div className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                            <StorefrontIcon className="w-5 h-5 mr-2 text-blue-500" />
                            <span>PICKUP FROM</span>
                        </div>
                        <p className="font-bold text-lg text-gray-800">{order.restaurantName}</p>
                        <p className="text-sm text-gray-600">{allMockRestaurants.find(r => r.name === order.restaurantName)?.address}</p>
                        {order.distance && <p className="text-sm text-gray-500 mt-1">{order.distance} km away</p>}
                    </div>
                ) : (
                    // Delivery Stage
                    <div>
                        <div className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                            <HomeIcon className="w-5 h-5 mr-2 text-green-500" />
                            <span>DELIVER TO</span>
                        </div>
                        <p className="font-bold text-lg text-gray-800">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.address.details}</p>
                        {order.distance && <p className="text-sm text-gray-500 mt-1">{order.distance} km away</p>}
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                 <button 
                    onClick={() => handleNavigation(destinationLocation)}
                    className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-[#FF6B00] rounded-full hover:bg-orange-600 transition-colors"
                >
                    Start Navigation
                </button>
                {isPickupStage ? (
                     <button onClick={() => onMarkAsPickedUp(order.id)} disabled={isUpdating} className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-50">
                        {isUpdating ? '...' : 'Mark as Picked Up'}
                    </button>
                ) : (
                    <button onClick={() => onMarkAsDelivered(order.id)} disabled={isUpdating} className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 disabled:opacity-50">
                        {isUpdating ? '...' : 'Mark as Delivered'}
                    </button>
                )}
            </div>
        </div>
    );
};

const DeliveredOrderCard: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-mono text-blue-600 font-semibold text-sm">Order #{order.id.split('-')[1]}</p>
                    <p className="text-xs text-gray-500">Delivered on: {order.date}</p>
                </div>
                 <div className="text-right">
                    <p className="text-sm text-gray-600">Delivery Fee Earned</p>
                    <p className="font-bold text-lg text-green-600">৳{order.deliveryFee.toFixed(2)}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-2 border-t">
                 <div>
                    <p className="text-xs font-semibold text-gray-500">PICKED UP FROM</p>
                    <p className="font-semibold text-gray-800">{order.restaurantName}</p>
                </div>
                 <div>
                    <p className="text-xs font-semibold text-gray-500">DELIVERED TO</p>
                    <p className="font-semibold text-gray-800">{order.customerName}</p>
                </div>
            </div>
        </div>
    );
}

const allMockRestaurants = [
    { id: 'restaurant-1', name: 'Restaurant Hub 1', address: '121 Flavor St, Food City' },
    { id: 'restaurant-2', name: 'Restaurant Hub 2', address: '122 Flavor St, Food City' },
    { id: 'restaurant-5', name: '24/7 Diner', address: '125 Flavor St, Food City' },
];

type Tab = 'new' | 'ongoing' | 'delivered';

const DashboardPage: React.FC = () => {
    const { currentRider, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('new');
    const [newOrders, setNewOrders] = useState<Order[]>([]);
    const [ongoingOrders, setOngoingOrders] = useState<Order[]>([]);
    const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const trackingIntervalRef = useRef<number | null>(null);

    const fetchNewOrders = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getRiderNewOrders();
            setNewOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load new orders.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchOngoingOrders = useCallback(async () => {
        if (!currentRider) return;
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getRiderOngoingOrders(currentRider.id);
            setOngoingOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load ongoing orders.');
        } finally {
            setIsLoading(false);
        }
    }, [currentRider]);
    
    const fetchDeliveredOrders = useCallback(async () => {
        if (!currentRider) return;
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getRiderDeliveredOrders(currentRider.id);
            setDeliveredOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load delivered orders.');
        } finally {
            setIsLoading(false);
        }
    }, [currentRider]);


    useEffect(() => {
        switch (activeTab) {
            case 'new':
                fetchNewOrders();
                break;
            case 'ongoing':
                fetchOngoingOrders();
                break;
            case 'delivered':
                fetchDeliveredOrders();
                break;
        }
    }, [activeTab, fetchNewOrders, fetchOngoingOrders, fetchDeliveredOrders]);

    const startLocationTracking = useCallback(() => {
        if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
        }
        if (!currentRider) return;

        trackingIntervalRef.current = window.setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await api.updateRiderLocation(currentRider.id, { lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                },
                { enableHighAccuracy: true }
            );
        }, 10000); // Update every 10 seconds

    }, [currentRider]);

    const stopLocationTracking = useCallback(() => {
        if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (ongoingOrders.length > 0) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }

        return () => {
            stopLocationTracking();
        };
    }, [ongoingOrders, startLocationTracking, stopLocationTracking]);

    const handleAccept = async (orderId: string) => {
        if (!currentRider) return;
        setUpdatingOrderId(orderId);
        try {
            await api.acceptRiderOrder(orderId, currentRider.id);
            setNewOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (err) {
            setError('Failed to accept order. It might have been taken by another rider.');
            fetchNewOrders(); // Refresh to see if it's gone
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleReject = (orderId: string) => {
        setNewOrders(prev => prev.filter(o => o.id !== orderId));
    };

    const handleMarkAsPickedUp = async (orderId: string) => {
        setUpdatingOrderId(orderId);
        try {
            await api.updateOrderStatus(orderId, 'On its way');
            fetchOngoingOrders(); // Refetch to update status
        } catch (err) {
            setError('Failed to update order status.');
        } finally {
            setUpdatingOrderId(null);
        }
    };
    
    const handleMarkAsDelivered = async (orderId: string) => {
        setUpdatingOrderId(orderId);
        try {
            await api.updateOrderStatus(orderId, 'Delivered');
            // Optimistically remove from ongoing list for instant UI feedback
            setOngoingOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (err) {
            setError('Failed to mark order as delivered.');
        } finally {
            setUpdatingOrderId(null);
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8 text-gray-500">Loading...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-500">{error}</div>;
        }

        switch (activeTab) {
            case 'new':
                return newOrders.length === 0
                    ? <div className="text-center p-8 text-gray-500">No new orders available right now. We'll keep looking!</div>
                    : <div className="space-y-4">{newOrders.map(order => <NewOrderCard key={order.id} order={order} onAccept={handleAccept} onReject={handleReject} isUpdating={updatingOrderId === order.id} />)}</div>;
            
            case 'ongoing':
                 return ongoingOrders.length === 0
                    ? <div className="text-center p-8 text-gray-500">You have no ongoing orders.</div>
                    : <div className="space-y-4">{ongoingOrders.map(order => <ActiveOrderJourney key={order.id} order={order} onMarkAsPickedUp={handleMarkAsPickedUp} onMarkAsDelivered={handleMarkAsDelivered} isUpdating={updatingOrderId === order.id} />)}</div>;

            case 'delivered':
                return deliveredOrders.length === 0
                    ? <div className="text-center p-8 text-gray-500">You haven't delivered any orders yet.</div>
                    : <div className="space-y-4">{deliveredOrders.map(order => <DeliveredOrderCard key={order.id} order={order} />)}</div>;

            default: return null;
        }
    }
    
    const tabs: { id: Tab, label: string }[] = [
        { id: 'new', label: 'New Orders' },
        { id: 'ongoing', label: 'Ongoing Orders' },
        { id: 'delivered', label: 'Delivered' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            <header className="bg-[#1E1E1E] text-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 pt-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Rider Dashboard</h1>
                        <p className="text-sm text-gray-300">Welcome, {currentRider?.name}</p>
                    </div>
                    <button onClick={logout} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                        <LogoutIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold hidden sm:block">Logout</span>
                    </button>
                </div>
                 <div className="container mx-auto px-4 mt-3">
                    <div className="flex border-b border-gray-700">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-orange-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4">
                {renderContent()}
            </main>
        </div>
    );
};

export default DashboardPage;
