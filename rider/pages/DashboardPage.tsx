
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '@shared/api';
import type { Order, LocationPoint, Restaurant } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { StorefrontIcon, HomeIcon, MapPinIcon, MoneyIcon, PackageIcon, ClockIcon, LogoutIcon, PhoneIcon, PowerIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';

// --- TYPES & HELPERS ---
type JourneyStop = {
    type: 'pickup' | 'delivery';
    orderId: string;
    stopId: string; // e.g. "pickup-ORDER-3"
    restaurantName?: string;
    customerName?: string;
    address: string;
    location?: LocationPoint;
    paymentMethod?: string;
    total?: number;
    phone?: string;
    items: Order['items'];
};

// Dummy restaurant data for addresses, since it's not on the main Order object
const allMockRestaurants: Pick<Restaurant, 'id' | 'name' | 'address'>[] = [
    { id: 'restaurant-1', name: 'Restaurant Hub 1', address: '121 Flavor St, Food City' },
    { id: 'restaurant-2', name: 'Restaurant Hub 2', address: '122 Flavor St, Food City' },
    { id: 'restaurant-5', name: '24/7 Diner', address: '125 Flavor St, Food City' },
];

const createJourney = (orders: Order[]): JourneyStop[] => {
    const pickups: JourneyStop[] = orders
        .filter(o => o.status === 'Preparing')
        .map(o => ({
            type: 'pickup',
            orderId: o.id,
            items: o.items,
            stopId: `pickup-${o.id}`,
            restaurantName: o.restaurantName,
            address: allMockRestaurants.find(r => r.name === o.restaurantName)?.address || 'Unknown Address',
            location: o.restaurantLocation,
        }));
    
    const deliveries: JourneyStop[] = orders
        .filter(o => o.status === 'On its way')
        .map(o => ({
            type: 'delivery',
            orderId: o.id,
            items: o.items,
            stopId: `delivery-${o.id}`,
            customerName: o.customerName,
            address: o.address.details,
            location: o.deliveryLocation,
            paymentMethod: o.paymentMethod,
            total: o.total,
            phone: '555-0100', // Mock customer phone
        }));
        
    return [...pickups, ...deliveries];
};

// --- SUB-COMPONENTS ---

const ActiveJourneyView: React.FC<{
    orders: Order[];
    onUpdateStatus: (orderId: string, status: Order['status']) => void;
    isUpdating: (orderId: string) => boolean;
}> = ({ orders, onUpdateStatus, isUpdating }) => {
    
    const journey = createJourney(orders);

    if (journey.length === 0) {
        return <div className="p-8 text-center text-gray-500">Finishing up...</div>;
    }
    
    const currentStop = journey[0];
    const upcomingStops = journey.slice(1);
    
    const handleNavigation = (location?: LocationPoint) => {
        if (location) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
        }
    };

    const isPickupStage = currentStop.type === 'pickup';
    const actionButton = isPickupStage ? (
        <button onClick={() => onUpdateStatus(currentStop.orderId, 'On its way')} disabled={isUpdating(currentStop.orderId)} className="w-full px-6 py-4 text-lg font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {isUpdating(currentStop.orderId) ? '...' : 'Confirm Pickup'}
        </button>
    ) : (
        <button onClick={() => onUpdateStatus(currentStop.orderId, 'Delivered')} disabled={isUpdating(currentStop.orderId)} className="w-full px-6 py-4 text-lg font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors">
            {isUpdating(currentStop.orderId) ? '...' : 'Confirm Delivery'}
        </button>
    );

    return (
        <div className="p-4 space-y-4 animate-fade-in-up">
            {/* Current Stop Card */}
            <div className="bg-white rounded-xl p-5 shadow-md border">
                <div className="flex items-center space-x-3 pb-3 border-b">
                    {isPickupStage ? <StorefrontIcon className="w-6 h-6 text-blue-500" /> : <HomeIcon className="w-6 h-6 text-green-500" />}
                    <div>
                        <p className="font-bold text-xl text-gray-800">{isPickupStage ? 'PICKUP' : 'DELIVERY'}</p>
                        <p className="text-sm text-gray-500">Order #{currentStop.orderId.split('-')[1]}</p>
                    </div>
                </div>
                <div className="py-4">
                    <p className="font-bold text-2xl text-gray-900">{isPickupStage ? currentStop.restaurantName : currentStop.customerName}</p>
                    <p className="text-gray-600 mt-1">{currentStop.address}</p>
                </div>
                <button onClick={() => handleNavigation(currentStop.location)} className="w-full flex items-center justify-center space-x-3 px-6 py-4 text-lg font-bold text-white bg-[#FF6B00] rounded-xl hover:bg-orange-600 transition-colors shadow-lg">
                    <MapPinIcon className="w-6 h-6"/>
                    <span>Navigate</span>
                </button>
                 {currentStop.type === 'delivery' && (
                    <div className="mt-4 space-y-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                             <span className="text-gray-600">Payment</span>
                             <span className={`font-bold text-base px-2 py-0.5 rounded-md ${currentStop.paymentMethod === 'Cash on Delivery' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                 {currentStop.paymentMethod === 'Cash on Delivery' ? `Collect Cash: ৳${currentStop.total?.toFixed(2)}` : 'Pre-paid'}
                             </span>
                         </div>
                        <a href={`tel:${currentStop.phone}`} className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100 transition-colors">
                            <PhoneIcon className="w-4 h-4 text-gray-600" />
                            <span>Call Customer</span>
                        </a>
                    </div>
                 )}
            </div>

            {/* Action Button */}
            <div className="pt-2">{actionButton}</div>

            {/* Upcoming Stops */}
            {upcomingStops.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-md border">
                    <h3 className="font-bold text-lg mb-2">Next up:</h3>
                    <ul className="space-y-3">
                        {upcomingStops.map(stop => (
                            <li key={stop.stopId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                                {stop.type === 'pickup' ? <StorefrontIcon className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <HomeIcon className="w-5 h-5 text-green-500 flex-shrink-0" />}
                                <div>
                                    <p className="font-semibold text-sm">{stop.type === 'pickup' ? stop.restaurantName : stop.customerName}</p>
                                    <p className="text-xs text-gray-500">{stop.address}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const NewOrderBanner: React.FC<{
    order: Order;
    onAccept: (orderId: string) => void;
    onDecline: () => void;
    isUpdating: boolean;
}> = ({ order, onAccept, onDecline, isUpdating }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] animate-fade-in-up">
        <div className="container mx-auto">
             <p className="font-semibold text-center text-sm mb-2 text-gray-700">New job opportunity nearby!</p>
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                    <p className="font-bold text-gray-800">{order.restaurantName}</p>
                    <p className="text-xs text-gray-500">{order.distance} km away &bull; {order.estimatedDeliveryTime}</p>
                </div>
                <div className="font-extrabold text-xl text-green-600 sm:mx-4">
                    + ৳{order.deliveryFee.toFixed(2)}
                </div>
                <div className="flex space-x-2">
                    <button onClick={onDecline} disabled={isUpdating} className="flex-1 sm:flex-auto flex items-center justify-center p-3 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                        <XCircleIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <button onClick={() => onAccept(order.id)} disabled={isUpdating} className="flex-1 sm:flex-auto flex items-center justify-center p-3 bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const NewOrderCard: React.FC<{ order: Order, onAccept: (orderId: string) => void, isUpdating: boolean }> = ({ order, onAccept, isUpdating }) => (
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
            <button onClick={() => onAccept(order.id)} disabled={isUpdating} className="w-full px-8 py-3 text-lg font-bold text-white bg-[#FF6B00] rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-lg">
                {isUpdating ? '...' : 'Accept Job'}
            </button>
        </div>
    </div>
);

const FindJobView: React.FC<{ orders: Order[], isOnline: boolean, onAccept: (orderId: string) => void, isUpdating: boolean }> = ({ orders, isOnline, onAccept, isUpdating }) => {
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
    return <div className="p-4 space-y-4">{orders.map(order => <NewOrderCard key={order.id} order={order} onAccept={onAccept} isUpdating={isUpdating} />)}</div>;
}

// --- MAIN DASHBOARD PAGE ---
const DashboardPage: React.FC = () => {
    const { currentRider, logout } = useAuth();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [availableJobs, setAvailableJobs] = useState<Order[]>([]);
    const [orderOpportunity, setOrderOpportunity] = useState<Order | null>(null);
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
            setActiveOrders(ongoing);
            
            if (ongoing.length > 0) {
                const opportunities = await api.getNewOrderOpportunities(currentRider.id);
                setOrderOpportunity(opportunities[0] || null);
                setAvailableJobs([]);
            } else {
                const newJobs = await api.getRiderNewOrders();
                setAvailableJobs(newJobs);
                setOrderOpportunity(null);
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
        } else {
            setActiveOrders([]);
            setAvailableJobs([]);
            setOrderOpportunity(null);
        }
    }, [currentRider, isOnline, fetchData]);

    const startLocationTracking = useCallback(() => { /* ... (same as before) ... */ }, []);
    const stopLocationTracking = useCallback(() => { /* ... (same as before) ... */ }, []);
    useEffect(() => { /* ... (same as before) ... */ }, []);

    const handleAcceptJob = async (orderId: string) => {
        if (!currentRider) return;
        setUpdatingOrderId(orderId);
        try {
            await api.acceptRiderOrder(orderId, currentRider.id);
            setOrderOpportunity(null); // Clear opportunity if we just accepted it
            await fetchData();
        } catch (err) {
            setError('Failed to accept order. It might have been taken.');
            fetchData();
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleDeclineOpportunity = () => {
        // Here you might add logic to ignore this offer for a while
        setOrderOpportunity(null);
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        setUpdatingOrderId(orderId);
        try {
            await api.updateOrderStatus(orderId, status);
            await fetchData();
        } catch (err) { setError('Failed to update order status.'); } 
        finally { setUpdatingOrderId(null); }
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
                            <button onClick={() => setIsOnline(!isOnline)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><LogoutIcon className="w-6 h-6 text-gray-600" /></button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto pb-32">
                {isLoading ? ( <div className="text-center p-8 text-gray-500">Loading...</div> )
                 : error ? ( <div className="text-center p-8 text-red-500">{error}</div> )
                 : activeOrders.length > 0 ? (
                    <ActiveJourneyView 
                        orders={activeOrders} 
                        onUpdateStatus={updateOrderStatus}
                        isUpdating={orderId => updatingOrderId === orderId}
                    />
                 ) : (
                    <FindJobView 
                        orders={availableJobs} 
                        isOnline={isOnline}
                        onAccept={handleAcceptJob}
                        isUpdating={!!updatingOrderId}
                    />
                 )
                }
            </main>
            
            {orderOpportunity && (
                <NewOrderBanner
                    order={orderOpportunity}
                    onAccept={handleAcceptJob}
                    onDecline={handleDeclineOpportunity}
                    isUpdating={!!updatingOrderId}
                />
            )}
        </div>
    );
};

export default DashboardPage;
