
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '@shared/api';
import type { Order, LocationPoint } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { StorefrontIcon, HomeIcon, MapPinIcon, MoneyIcon, PackageIcon, ClockIcon, LogoutIcon, PhoneIcon, PowerIcon } from '../components/Icons';

// --- ACTIVE DELIVERY COMPONENT ---
const ActiveDeliveryView: React.FC<{
    order: Order,
    onMarkAsPickedUp: (orderId: string) => void,
    onMarkAsDelivered: (orderId: string) => void,
    isUpdating: boolean
}> = ({ order, onMarkAsPickedUp, onMarkAsDelivered, isUpdating }) => {
    
    const handleNavigation = (location?: LocationPoint) => {
        if (location) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
        }
    };

    const isPickupStage = order.status === 'Preparing';
    const destinationLocation = isPickupStage ? order.restaurantLocation : order.deliveryLocation;
    const stageTitle = isPickupStage ? "PICKUP" : "DELIVERY";
    const stageIcon = isPickupStage ? <StorefrontIcon className="w-6 h-6 text-blue-500" /> : <HomeIcon className="w-6 h-6 text-green-500" />;
    const destinationName = isPickupStage ? order.restaurantName : order.customerName;
    const destinationAddress = isPickupStage 
        ? allMockRestaurants.find(r => r.name === order.restaurantName)?.address 
        : order.address.details;
    const actionButton = isPickupStage ? (
        <button onClick={() => onMarkAsPickedUp(order.id)} disabled={isUpdating} className="w-full px-6 py-4 text-lg font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {isUpdating ? '...' : 'Confirm Pickup'}
        </button>
    ) : (
        <button onClick={() => onMarkAsDelivered(order.id)} disabled={isUpdating} className="w-full px-6 py-4 text-lg font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors">
            {isUpdating ? '...' : 'Confirm Delivery'}
        </button>
    );

    return (
        <div className="p-4 space-y-4 animate-fade-in-up">
            <div className="bg-white rounded-xl p-5 shadow-md border">
                {/* Stage Header */}
                <div className="flex items-center space-x-3 pb-3 border-b">
                    {stageIcon}
                    <div>
                        <p className="font-bold text-xl text-gray-800">{stageTitle}</p>
                        <p className="text-sm text-gray-500">Order #{order.id.split('-')[1]}</p>
                    </div>
                </div>

                {/* Destination Details */}
                <div className="py-4">
                    <p className="font-bold text-2xl text-gray-900">{destinationName}</p>
                    <p className="text-gray-600 mt-1">{destinationAddress}</p>
                </div>
                
                {/* Navigation Button */}
                <button 
                    onClick={() => handleNavigation(destinationLocation)}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 text-lg font-bold text-white bg-[#FF6B00] rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
                >
                    <MapPinIcon className="w-6 h-6"/>
                    <span>Navigate</span>
                </button>
            </div>
            
            {/* Customer/Payment Info */}
            <div className="bg-white rounded-xl p-5 shadow-md border">
                 <h3 className="font-bold text-lg mb-2">Details</h3>
                 <div className="space-y-3">
                     <div className="flex items-center justify-between">
                         <span className="text-gray-600">Customer Name</span>
                         <span className="font-semibold">{order.customerName}</span>
                     </div>
                     <div className="flex items-center justify-between">
                         <span className="text-gray-600">Payment</span>
                         <span className={`font-bold text-base px-2 py-0.5 rounded-md ${order.paymentMethod === 'Cash on Delivery' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                             {order.paymentMethod === 'Cash on Delivery' ? `Collect Cash: ৳${order.total.toFixed(2)}` : 'Pre-paid'}
                         </span>
                     </div>
                      <a href={`tel:${order.customerName}`} className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100 transition-colors">
                        <PhoneIcon className="w-4 h-4 text-gray-600" />
                        <span>Call Customer</span>
                    </a>
                 </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
                {actionButton}
            </div>
        </div>
    );
};

// --- NEW JOB CARD COMPONENT ---
const NewOrderCard: React.FC<{ 
    order: Order, 
    onAccept: (orderId: string) => void,
    isUpdating: boolean
}> = ({ order, onAccept, isUpdating }) => {
    return (
        <div className="bg-white rounded-xl p-4 shadow-md border animate-fade-in-up">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-gray-800">{order.restaurantName}</p>
                    <p className="text-sm text-gray-500">{allMockRestaurants.find(r => r.name === order.restaurantName)?.address}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xs font-semibold text-green-600">EARNING</p>
                    <p className="font-extrabold text-2xl text-green-600">৳{order.deliveryFee.toFixed(2)}</p>
                </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-between text-sm text-gray-700">
                <span className="font-semibold">{order.distance} km away</span>
                <span className="font-semibold">{order.estimatedDeliveryTime}</span>
            </div>

            <div className="mt-4">
                <button
                    onClick={() => onAccept(order.id)}
                    disabled={isUpdating}
                    className="w-full px-8 py-3 text-lg font-bold text-white bg-[#FF6B00] rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-lg"
                >
                     {isUpdating ? '...' : 'Accept Job'}
                </button>
            </div>
        </div>
    );
};

// --- FIND JOB VIEW COMPONENT ---
const FindJobView: React.FC<{ 
    orders: Order[], 
    isOnline: boolean,
    onAccept: (orderId: string) => void,
    isUpdating: boolean,
}> = ({ orders, isOnline, onAccept, isUpdating }) => {
    if (!isOnline) {
        return <div className="text-center p-8 text-gray-500">You are offline. Toggle the switch in the header to go online and find new jobs.</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 space-y-2">
                <p className="font-semibold">Waiting for new jobs...</p>
                <p className="text-sm">We'll notify you when a new order is available in your area.</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 space-y-4">
            {orders.map(order => <NewOrderCard key={order.id} order={order} onAccept={onAccept} isUpdating={isUpdating} />)}
        </div>
    );
}

// Dummy restaurant data for addresses, since it's not on the main Order object
const allMockRestaurants = [
    { id: 'restaurant-1', name: 'Restaurant Hub 1', address: '121 Flavor St, Food City' },
    { id: 'restaurant-2', name: 'Restaurant Hub 2', address: '122 Flavor St, Food City' },
    { id: 'restaurant-5', name: '24/7 Diner', address: '125 Flavor St, Food City' },
];

// --- MAIN DASHBOARD PAGE ---
const DashboardPage: React.FC = () => {
    const { currentRider, logout } = useAuth();
    const [ongoingOrder, setOngoingOrder] = useState<Order | null>(null);
    const [newOrders, setNewOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const trackingIntervalRef = useRef<number | null>(null);

    const fetchData = useCallback(async (showLoading = false) => {
        if (!currentRider) return;
        if (showLoading) setIsLoading(true);
        setError('');
        try {
            const ongoing = await api.getRiderOngoingOrders(currentRider.id);
            setOngoingOrder(ongoing[0] || null);
            if (!ongoing[0]) {
                const newOrdersData = await api.getRiderNewOrders();
                setNewOrders(newOrdersData);
            } else {
                setNewOrders([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data.');
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [currentRider]);

    useEffect(() => {
        if (currentRider && isOnline) {
            fetchData(true);
            const interval = setInterval(() => fetchData(false), 15000);
            return () => clearInterval(interval);
        }
    }, [currentRider, isOnline, fetchData]);

    const startLocationTracking = useCallback(() => {
        if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
        if (!currentRider) return;
        trackingIntervalRef.current = window.setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (pos) => api.updateRiderLocation(currentRider.id, { lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error("Geolocation error:", err),
                { enableHighAccuracy: true }
            );
        }, 10000);
    }, [currentRider]);

    const stopLocationTracking = useCallback(() => {
        if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (ongoingOrder) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
        return stopLocationTracking;
    }, [ongoingOrder, startLocationTracking, stopLocationTracking]);

    const handleAccept = async (orderId: string) => {
        if (!currentRider) return;
        setUpdatingOrderId(orderId);
        try {
            const acceptedOrder = await api.acceptRiderOrder(orderId, currentRider.id);
            setOngoingOrder(acceptedOrder);
            setNewOrders([]);
        } catch (err) {
            setError('Failed to accept order. It might have been taken.');
            fetchData();
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        setUpdatingOrderId(orderId);
        try {
            await api.updateOrderStatus(orderId, status);
            await fetchData();
        } catch (err) {
            setError('Failed to update order status.');
        } finally {
            setUpdatingOrderId(null);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white text-gray-800 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">FoodieFind Rider</h1>
                        <p className="text-sm text-gray-500">Welcome, {currentRider?.name}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                             <span className={`text-sm font-semibold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>{isOnline ? 'Online' : 'Offline'}</span>
                            <button
                                onClick={() => setIsOnline(!isOnline)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <LogoutIcon className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto">
                {isLoading ? (
                    <div className="text-center p-8 text-gray-500">Loading...</div>
                ) : error ? (
                    <div className="text-center p-8 text-red-500">{error}</div>
                ) : ongoingOrder ? (
                    <ActiveDeliveryView 
                        order={ongoingOrder} 
                        onMarkAsPickedUp={(id) => updateOrderStatus(id, 'On its way')}
                        onMarkAsDelivered={(id) => updateOrderStatus(id, 'Delivered')}
                        isUpdating={updatingOrderId === ongoingOrder.id}
                    />
                ) : (
                    <FindJobView 
                        orders={newOrders} 
                        isOnline={isOnline}
                        onAccept={handleAccept}
                        isUpdating={!!updatingOrderId}
                    />
                )}
            </main>
        </div>
    );
};

export default DashboardPage;
