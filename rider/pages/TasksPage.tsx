import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '@shared/api';
import type { Order, LocationPoint, Restaurant } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { StorefrontIcon, HomeIcon, MapPinIcon, PhoneIcon, LogoutIcon, PowerIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';

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

            <div className="pt-2">{actionButton}</div>

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

const FindJobView: React.FC<{ orders: Order[], onAccept: (orderId: string) => void, isUpdating: boolean, hasMaxOrders: boolean }> = ({ orders, onAccept, isUpdating, hasMaxOrders }) => {
    if (hasMaxOrders) {
        return <div className="text-center p-8 text-gray-600 bg-blue-50 rounded-lg m-4">
            <p className="font-bold text-lg">Order Limit Reached</p>
            <p className="text-sm">You are currently handling 2 orders. Please complete a delivery to accept new jobs.</p>
        </div>
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

const TasksPage: React.FC = () => {
    const { currentRider, logout } = useAuth();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [availableJobs, setAvailableJobs] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const hasMaxOrders = activeOrders.length >= 2;

    const fetchData = useCallback(async (showLoading = false) => {
        if (!currentRider) return;
        if (showLoading) setIsLoading(true);
        setError('');
        try {
            const ongoing = await api.getRiderOngoingOrders(currentRider.id);
            setActiveOrders(ongoing);
            
            if (ongoing.length < 2) {
                const newJobs = await api.getRiderNewOrders();
                setAvailableJobs(newJobs);
            } else {
                setAvailableJobs([]); // Don't fetch new jobs if at capacity
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
        }
    }, [currentRider, isOnline, fetchData]);

    const handleAcceptJob = async (orderId: string) => {
        if (!currentRider) return;
        setUpdatingOrderId(orderId);
        try {
            await api.acceptRiderOrder(orderId, currentRider.id);
            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to accept order. It might have been taken.');
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
        } catch (err) { setError('Failed to update order status.'); } 
        finally { setUpdatingOrderId(null); }
    };

    return (
        <div>
            <header className="bg-white text-gray-800 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Rider Dashboard</h1>
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

            <main className="container mx-auto">
                {isLoading ? ( <div className="text-center p-8 text-gray-500">Loading...</div> )
                 : error ? ( <div className="text-center p-8 text-red-500">{error}</div> )
                 : !isOnline ? (<div className="text-center p-8 text-gray-500">You are offline. Go online to see tasks.</div>)
                 : activeOrders.length > 0 ? (
                    <ActiveJourneyView 
                        orders={activeOrders} 
                        onUpdateStatus={updateOrderStatus}
                        isUpdating={orderId => updatingOrderId === orderId}
                    />
                 ) : (
                    <FindJobView 
                        orders={availableJobs}
                        onAccept={handleAcceptJob}
                        isUpdating={!!updatingOrderId}
                        hasMaxOrders={hasMaxOrders}
                    />
                 )
                }
            </main>
        </div>
    );
};

export default TasksPage;
