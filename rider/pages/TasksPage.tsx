import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import type { Order, LocationPoint } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { StorefrontIcon, HomeIcon, MapPinIcon, PhoneIcon, CheckCircleIcon } from '../components/Icons';

type Task = {
    type: 'pickup' | 'delivery';
    orderId: string;
    name: string;
    address: string;
    location?: LocationPoint;
    paymentMethod?: string;
    total?: number;
    phone?: string;
};

const JobCard: React.FC<{ order: Order, onAccept: (orderId: string) => void, isUpdating: boolean }> = ({ order, onAccept, isUpdating }) => (
    <div className="bg-white rounded-xl p-4 shadow-md border animate-fade-in-up">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-lg text-gray-800">{order.restaurantName}</p>
                <p className="text-sm text-gray-500">{order.address.details}</p>
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
                {isUpdating ? 'Accepting...' : 'Accept Job'}
            </button>
        </div>
    </div>
);

const TaskCard: React.FC<{
    task: Task;
    onUpdateStatus: (orderId: string, status: Order['status']) => void;
    isUpdating: boolean;
    isCurrent: boolean;
}> = ({ task, onUpdateStatus, isUpdating, isCurrent }) => {
    
    const handleNavigation = (location?: LocationPoint) => {
        if (location) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
        }
    };
    
    const isPickup = task.type === 'pickup';
    
    return (
        <div className={`bg-white rounded-xl p-5 shadow-md border transition-all ${isCurrent ? 'border-[#FF6B00]' : 'opacity-70'}`}>
            <div className="flex items-center space-x-3 pb-3 border-b">
                {isPickup ? <StorefrontIcon className="w-6 h-6 text-blue-500" /> : <HomeIcon className="w-6 h-6 text-green-500" />}
                <div>
                    <p className="font-bold text-xl text-gray-800">{isPickup ? 'PICKUP' : 'DELIVERY'}</p>
                    <p className="text-sm text-gray-500">Order #{task.orderId.split('-')[1]}</p>
                </div>
            </div>
            <div className="py-4">
                <p className="font-bold text-2xl text-gray-900">{task.name}</p>
                <p className="text-gray-600 mt-1">{task.address}</p>
            </div>
            {isCurrent && (
                <div className="space-y-3">
                    <button onClick={() => handleNavigation(task.location)} className="w-full flex items-center justify-center space-x-3 px-6 py-4 text-lg font-bold text-white bg-[#FF6B00] rounded-xl hover:bg-orange-600 transition-colors shadow-lg">
                        <MapPinIcon className="w-6 h-6"/>
                        <span>Navigate</span>
                    </button>
                    {!isPickup && (
                         <div className="space-y-3 pt-3 border-t">
                            <div className="flex items-center justify-between">
                                 <span className="text-gray-600">Payment</span>
                                 <span className={`font-bold text-base px-2 py-0.5 rounded-md ${task.paymentMethod === 'Cash on Delivery' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                     {task.paymentMethod === 'Cash on Delivery' ? `Collect Cash: ৳${task.total?.toFixed(2)}` : 'Pre-paid'}
                                 </span>
                             </div>
                            <a href={`tel:${task.phone}`} className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100 transition-colors">
                                <PhoneIcon className="w-4 h-4 text-gray-600" />
                                <span>Call Customer</span>
                            </a>
                        </div>
                    )}
                    <button 
                        onClick={() => onUpdateStatus(task.orderId, isPickup ? 'On its way' : 'Delivered')}
                        disabled={isUpdating}
                        className={`w-full flex items-center justify-center space-x-3 px-6 py-4 text-lg font-bold text-white rounded-xl transition-colors disabled:opacity-50 ${isPickup ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                        <CheckCircleIcon className="w-6 h-6" />
                        <span>{isUpdating ? '...' : (isPickup ? 'Confirm Pickup' : 'Confirm Delivery')}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

interface TasksPageProps {
    isOnline: boolean;
}

const TasksPage: React.FC<TasksPageProps> = ({ isOnline }) => {
    const { currentRider } = useAuth();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [availableJobs, setAvailableJobs] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const fetchData = useCallback(async (showLoading = false) => {
        if (!currentRider) return;
        if (showLoading) setIsLoading(true);
        setError('');
        try {
            const [ongoing, newJobs] = await Promise.all([
                api.getRiderOngoingOrders(currentRider.id),
                api.getRiderNewOrders(currentRider.id),
            ]);
            setActiveOrders(ongoing);
            setAvailableJobs(newJobs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data.');
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [currentRider]);

    useEffect(() => {
        if (currentRider && isOnline) {
            fetchData(true);
            const interval = setInterval(() => fetchData(false), 10000); // Poll every 10 seconds
            return () => clearInterval(interval);
        } else {
            setActiveOrders([]);
            setAvailableJobs([]);
            setIsLoading(false);
        }
    }, [currentRider, isOnline, fetchData]);

    const handleAcceptJob = async (orderId: string) => {
        if (!currentRider) return;
        setUpdatingOrderId(orderId);
        try {
            await api.acceptRiderOrder(orderId, currentRider.id);
            await fetchData();
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
            // For riders, 'On its way' means they have picked it up.
            // For 'Delivered', it's the final step.
            await api.updateOrderStatus(orderId, status);
            await fetchData();
        } catch (err) { setError('Failed to update order status.'); } 
        finally { setUpdatingOrderId(null); }
    };

    const renderContent = () => {
        if (isLoading) return <div className="text-center p-8 text-gray-500">Loading...</div>;
        if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

        if (activeOrders.length > 0) {
            // Create a sorted list of tasks: all pickups first, then all deliveries
            const tasks: Task[] = [];
            activeOrders.forEach(order => {
                tasks.push({
                    type: 'pickup',
                    orderId: order.id,
                    name: order.restaurantName,
                    address: 'Mock restaurant address', // This should be on the order object ideally
                    location: order.restaurantLocation,
                });
                tasks.push({
                    type: 'delivery',
                    orderId: order.id,
                    name: order.customerName || 'Customer',
                    address: order.address.details,
                    location: order.deliveryLocation,
                    paymentMethod: order.paymentMethod,
                    total: order.total,
                    phone: '555-0100', // Mock
                });
            });

            return (
                <div className="p-4 space-y-4">
                    {tasks.map((task, index) => (
                        <TaskCard 
                            key={`${task.orderId}-${task.type}`}
                            task={task}
                            onUpdateStatus={updateOrderStatus}
                            isUpdating={updatingOrderId === task.orderId}
                            isCurrent={index === 0}
                        />
                    ))}
                </div>
            );
        }

        if (!isOnline) {
            return <div className="text-center p-8 text-gray-500">You are offline. Go online to find new jobs.</div>;
        }

        if (availableJobs.length > 0) {
            return (
                <div className="p-4 space-y-4">
                    {availableJobs.map(job => (
                        <JobCard 
                            key={job.id} 
                            order={job} 
                            onAccept={handleAcceptJob}
                            isUpdating={updatingOrderId === job.id}
                        />
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center p-8 text-gray-500 space-y-2">
                <p className="font-semibold">Waiting for new jobs...</p>
                <p className="text-sm">We'll notify you when a new order is available in your area.</p>
            </div>
        );
    };

    return <div className="animate-fade-in-up">{renderContent()}</div>;
};

export default TasksPage;