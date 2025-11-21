
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '@shared/api';
import type { Order, LocationPoint, Restaurant } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { StorefrontIcon, HomeIcon, MapPinIcon, LogoutIcon, CheckCircleIcon, ClockIcon, TasksIcon, BellIcon } from '../components/Icons';
import EmptyState from '@shared/components/EmptyState';
import { SkeletonCard } from '@shared/components/Skeletons';
import { useBrowserNotification } from '@shared/hooks/useBrowserNotification';

// --- DUMMY DATA (for UI, as API doesn't provide it on order) ---
const allMockRestaurants: (Pick<Restaurant, 'id' | 'name' | 'address'> & { coverImageUrl: string })[] = [
    { 
        id: 'restaurant-1', 
        name: 'Restaurant Hub 1', 
        address: '121 Flavor St, Food City',
        coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    { 
        id: 'restaurant-2', 
        name: 'Restaurant Hub 2', 
        address: '122 Flavor St, Food City',
        coverImageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    { 
        id: 'restaurant-26', 
        name: '24/7 Diner', 
        address: '125 Flavor St, Food City',
        coverImageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
];

// --- UTILITY ---
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// --- SUB-COMPONENTS ---

const Timer: React.FC<{ acceptedAt: string }> = ({ acceptedAt }) => {
    const [timeLeft, setTimeLeft] = useState(30 * 60);

    useEffect(() => {
        if (!acceptedAt) return;
        const deadline = new Date(acceptedAt).getTime() + 30 * 60 * 1000;

        const updateTimer = () => {
            const remaining = Math.round((deadline - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [acceptedAt]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const colorClass = minutes < 10 ? 'text-red-500' : minutes < 20 ? 'text-yellow-500' : 'text-green-500';

    if (timeLeft <= 0) {
        return (
            <div className="text-center">
                <span className="font-bold text-red-500 text-lg">LATE</span>
                <p className="text-xs text-red-500">Please deliver ASAP.</p>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-1">
            <ClockIcon className={`w-5 h-5 ${colorClass}`} />
            <span className={`font-bold text-lg ${colorClass}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

const OrderCard: React.FC<{
    order: Order;
    onUpdateStatus: (orderId: string, status: Order['status']) => void;
    isUpdating: (orderId: string) => boolean;
}> = ({ order, onUpdateStatus, isUpdating }) => {
    
    const isPickupStage = order.status === 'Preparing';
    const currentStageLocation = isPickupStage ? order.restaurantLocation : order.deliveryLocation;

    const handleNavigation = (location?: LocationPoint) => {
        if (location) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
        }
    };
    
    return (
        <div className="bg-white rounded-xl p-4 shadow-md border animate-fade-in-up space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b">
                <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-mono font-semibold text-blue-600">{order.id.split('-')[1]}</p>
                </div>
                {order.acceptedAt && <Timer acceptedAt={order.acceptedAt} />}
            </div>
            
            {/* Journey Steps */}
            <div className="space-y-3">
                {/* Pickup Step */}
                <div className={`flex items-start space-x-3 p-3 rounded-lg ${isPickupStage ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                    <StorefrontIcon className={`w-6 h-6 mt-1 flex-shrink-0 ${isPickupStage ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                        <p className={`font-semibold ${isPickupStage ? 'text-blue-700' : 'text-gray-600'}`}>Pickup</p>
                        <p className="text-sm font-bold text-gray-800">{order.restaurantName}</p>
                        <p className="text-xs text-gray-500">{allMockRestaurants.find(r => r.name === order.restaurantName)?.address}</p>
                    </div>
                </div>

                {/* Delivery Step */}
                 <div className={`flex items-start space-x-3 p-3 rounded-lg ${!isPickupStage ? 'bg-green-50 border-l-4 border-green-500' : ''}`}>
                    <HomeIcon className={`w-6 h-6 mt-1 flex-shrink-0 ${!isPickupStage ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                        <p className={`font-semibold ${!isPickupStage ? 'text-green-700' : 'text-gray-600'}`}>Delivery</p>
                        <p className="text-sm font-bold text-gray-800">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.address.details}</p>
                    </div>
                </div>
            </div>

            {/* Payment Info for Delivery */}
            {!isPickupStage && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-gray-600 font-medium">Payment</span>
                    <span className={`font-bold text-base px-2 py-0.5 rounded-md ${order.paymentMethod === 'Cash on Delivery' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {order.paymentMethod === 'Cash on Delivery' ? `Collect: ৳${order.total?.toFixed(2)}` : 'Pre-paid'}
                    </span>
                </div>
            )}
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <button onClick={() => handleNavigation(currentStageLocation)} className="flex items-center justify-center space-x-2 px-4 py-3 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    <MapPinIcon className="w-5 h-5"/>
                    <span>Navigate</span>
                </button>
                {isPickupStage ? (
                     <button onClick={() => onUpdateStatus(order.id, 'On its way')} disabled={isUpdating(order.id)} className="flex items-center justify-center space-x-2 px-4 py-3 font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors">
                        <CheckCircleIcon className="w-5 h-5"/>
                        <span>Confirm Pickup</span>
                    </button>
                ) : (
                    <button onClick={() => onUpdateStatus(order.id, 'Delivered')} disabled={isUpdating(order.id)} className="flex items-center justify-center space-x-2 px-4 py-3 font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors">
                        <CheckCircleIcon className="w-5 h-5"/>
                        <span>Confirm Delivery</span>
                    </button>
                )}
            </div>
        </div>
    );
};

const ActiveOrdersDashboard: React.FC<{
    orders: Order[];
    onUpdateStatus: (orderId: string, status: Order['status']) => void;
    isUpdating: (orderId: string) => boolean;
}> = ({ orders, onUpdateStatus, isUpdating }) => {
    return (
        <div className="p-4 space-y-4">
             <h2 className="text-xl font-bold text-gray-800">
                Active Orders: <span className="text-[#FF6B00]">{orders.length}/2</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} isUpdating={isUpdating} />
                ))}
            </div>
        </div>
    );
};


const NewOrderCard: React.FC<{ order: Order, onAccept: (orderId: string) => void, isUpdating: boolean, riderLocation: LocationPoint | null }> = ({ order, onAccept, isUpdating, riderLocation }) => {
    
    const restaurantInfo = allMockRestaurants.find(r => r.name === order.restaurantName);

    const distRiderToRest = (riderLocation && order.restaurantLocation) 
        ? getDistanceFromLatLonInKm(riderLocation.lat, riderLocation.lng, order.restaurantLocation.lat, order.restaurantLocation.lng).toFixed(1) 
        : '...';

    const distRestToCust = (order.restaurantLocation && order.deliveryLocation)
        ? getDistanceFromLatLonInKm(order.restaurantLocation.lat, order.restaurantLocation.lng, order.deliveryLocation.lat, order.deliveryLocation.lng).toFixed(1)
        : '...';

    return (
        <div className="bg-white rounded-xl shadow-md border animate-fade-in-up relative overflow-hidden">
            
            {/* Restaurant Cover Image */}
            <div className="h-32 w-full relative">
                <img 
                    src={restaurantInfo?.coverImageUrl || 'https://via.placeholder.com/800x400?text=Restaurant'} 
                    alt={order.restaurantName} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Earning Badge on Image */}
                <div className="absolute top-3 right-3 bg-white/90 text-green-800 px-3 py-1 rounded-lg font-bold text-sm shadow-sm backdrop-blur-sm">
                    Earn ৳{order.deliveryFee.toFixed(2)}
                </div>
                
                <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-lg shadow-sm">{order.restaurantName}</h3>
                </div>
            </div>

            <div className="p-5">
                <div className="mb-4 flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-gray-800">New Delivery Job</h4>
                        <p className="text-xs text-gray-500 font-mono">#{order.id.split('-')[1]}</p>
                    </div>
                </div>

                {/* Timeline View */}
                <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:left-[21px] before:top-2 before:bottom-6 before:w-0.5 before:bg-gray-300 before:border-l before:border-dashed">
                    
                    {/* Pickup Point */}
                    <div className="relative flex items-start">
                        <div className="absolute -left-[21px] bg-blue-100 p-1 rounded-full z-10">
                            <StorefrontIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="ml-2">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Pickup ({distRiderToRest} km away)</p>
                            <p className="text-sm text-gray-500">{restaurantInfo?.address || 'Address hidden until accepted'}</p>
                        </div>
                    </div>

                    {/* Dropoff Point */}
                    <div className="relative flex items-start">
                        <div className="absolute -left-[21px] bg-green-100 p-1 rounded-full z-10">
                            <HomeIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="ml-2">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Dropoff ({distRestToCust} km trip)</p>
                            <p className="text-sm text-gray-500">{order.address.details}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button onClick={() => onAccept(order.id)} disabled={isUpdating} className="w-full px-8 py-3 text-lg font-bold text-white bg-[#FF6B00] rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-lg flex items-center justify-center">
                        {isUpdating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Accepting...
                            </>
                        ) : 'Accept Delivery'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FindJobView: React.FC<{ orders: Order[], onAccept: (orderId: string) => void, isUpdating: boolean, hasMaxOrders: boolean, riderLocation: LocationPoint | null }> = ({ orders, onAccept, isUpdating, hasMaxOrders, riderLocation }) => {
    if (hasMaxOrders) {
        return <div className="text-center p-8 text-gray-600 bg-blue-50 rounded-lg m-4">
            <p className="font-bold text-lg">Order Limit Reached</p>
            <p className="text-sm">You are currently handling 2 orders. Please complete a delivery to accept new jobs.</p>
        </div>
    }

    if (orders.length === 0) {
        return (
            <div className="p-4">
                <EmptyState
                    title="Waiting for jobs"
                    description="We'll notify you when a new order is available in your area."
                    icon={<TasksIcon className="w-12 h-12 text-gray-300" />}
                />
            </div>
        );
    }
    return (
        <div className="p-4 space-y-4">
            {orders.map(order => (
                <NewOrderCard 
                    key={order.id} 
                    order={order} 
                    onAccept={onAccept} 
                    isUpdating={isUpdating} 
                    riderLocation={riderLocation}
                />
            ))}
        </div>
    );
}

const TasksPage: React.FC = () => {
    const { currentRider, logout } = useAuth();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [availableJobs, setAvailableJobs] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const { permission, requestPermission, sendNotification } = useBrowserNotification();
    const previousJobIdsRef = useRef<Set<string>>(new Set());

    const hasMaxOrders = activeOrders.length >= 2;

    const fetchData = useCallback(async (showLoading = false) => {
        if (!currentRider) return;
        if (showLoading) setIsLoading(true);
        setError('');
        try {
            const ongoing = await api.getRiderOngoingOrders(currentRider.id);
            setActiveOrders(ongoing);
            
            if (ongoing.length < 2) {
                const newJobs = await api.getRiderNewOrders(currentRider.id);
                setAvailableJobs(newJobs);

                // Notify for new jobs
                newJobs.forEach(job => {
                    if (!previousJobIdsRef.current.has(job.id)) {
                        sendNotification('New Delivery Job!', {
                            body: `From ${job.restaurantName} - Earn ৳${job.deliveryFee.toFixed(2)}`
                        });
                    }
                });
                previousJobIdsRef.current = new Set(newJobs.map(j => j.id));

            } else {
                setAvailableJobs([]); 
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data.');
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [currentRider, sendNotification]);

    useEffect(() => {
        if (currentRider && isOnline) {
            fetchData(true);
            const interval = setInterval(() => fetchData(false), 10000); // Poll every 10s
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

    const hasActiveOrders = activeOrders.length > 0;

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
            
            {permission === 'default' && isOnline && (
                <div className="container mx-auto px-4 mt-2">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 flex justify-between items-center rounded-r-md">
                        <div className="flex items-center">
                            <BellIcon className="w-5 h-5 text-blue-500 mr-2" />
                            <span className="text-sm text-blue-700">Get notified about new jobs instantly!</span>
                        </div>
                        <button onClick={requestPermission} className="text-xs font-bold bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600">Allow</button>
                    </div>
                </div>
            )}

            <main className="container mx-auto">
                {isLoading ? ( 
                    <div className="p-4 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                 )
                 : error ? ( <div className="text-center p-8 text-red-500">{error}</div> )
                 : !isOnline ? (
                    <div className="p-4">
                        <EmptyState
                            title="You are offline"
                            description="Go online to start receiving delivery tasks."
                            icon={<LogoutIcon className="w-12 h-12 text-gray-400" />}
                            actionLabel="Go Online"
                            onAction={() => setIsOnline(true)}
                        />
                    </div>
                 )
                 : hasActiveOrders ? (
                    <ActiveOrdersDashboard 
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
                        riderLocation={currentRider?.location || null}
                    />
                 )
                }
            </main>
        </div>
    );
};

export default TasksPage;
