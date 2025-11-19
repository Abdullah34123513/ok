
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '@shared/types';
import RiderTrackingMap from '../components/RiderTrackingMap';
import { MapPinIcon, DashboardIcon, BellIcon } from '../components/Icons';
import EmptyState from '@shared/components/EmptyState';
import { SkeletonTableRow, SkeletonCard } from '@shared/components/Skeletons';
import { useBrowserNotification } from '@shared/hooks/useBrowserNotification';

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusStyles: Record<Order['status'], string> = {
        'Placed': 'bg-blue-100 text-blue-800',
        'Preparing': 'bg-yellow-100 text-yellow-800',
        'On its way': 'bg-purple-100 text-purple-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
        'Pending': 'bg-gray-100 text-gray-800',
    };
    const textMap: Record<Order['status'], string> = {
        'Placed': 'New Order',
        'Preparing': 'Preparing',
        'On its way': 'Ready for Pickup',
        'Delivered': 'Delivered',
        'Cancelled': 'Cancelled',
        'Pending': 'Pending',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {textMap[status]}
        </span>
    );
};


const OrderStatusButton: React.FC<{ 
    order: Order, 
    onUpdate: (orderId: string, status: Order['status']) => void,
    isUpdating: boolean,
    className?: string 
}> = ({ order, onUpdate, isUpdating, className }) => {
    
    const handleClick = (newStatus: Order['status']) => {
        onUpdate(order.id, newStatus);
    };

    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-md transition-colors disabled:opacity-50";
    const isDisabled = isUpdating;

    switch (order.status) {
        case 'Placed':
            return (
                <div className={`flex items-center space-x-2 ${className}`}>
                    <button 
                        onClick={() => handleClick('Cancelled')} 
                        disabled={isDisabled} 
                        className={`${baseClasses} bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300`}
                    >
                        {isUpdating ? '...' : 'Reject'}
                    </button>
                    <button 
                        onClick={() => handleClick('Preparing')} 
                        disabled={isDisabled} 
                        className={`${baseClasses} bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300`}
                    >
                        {isUpdating ? '...' : 'Accept'}
                    </button>
                </div>
            );
        case 'Preparing':
            return <button onClick={() => handleClick('On its way')} disabled={isDisabled} className={`${baseClasses} bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 ${className}`}>
                {isUpdating ? '...' : 'Mark as Ready'}
            </button>;
        case 'On its way':
            return null; // Vendor's job is done for this view
        default:
            return null; // Hide button for other statuses like Cancelled/Delivered
    }
};

const calculateETA = (durationString?: string) => {
    if (!durationString) return null;
    
    // If it already looks like a time (contains :) or AM/PM, return it
    if (durationString.includes(':') || durationString.includes('AM') || durationString.includes('PM')) {
        return durationString;
    }
    
    const matches = durationString.match(/(\d+)/g);
    if (matches && matches.length > 0) {
        // Take the last number found as the max duration (e.g. "20-30" -> 30)
        const minutes = parseInt(matches[matches.length - 1], 10);
        const eta = new Date(Date.now() + minutes * 60000);
        return eta.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    return durationString;
};

const DashboardPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const { permission, requestPermission, sendNotification } = useBrowserNotification();
    
    // Ref to track orders we've already seen to detect new ones for notifications
    const previousOrderIdsRef = useRef<Set<string>>(new Set());

    const toggleTrackingMap = (orderId: string) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    const fetchOrders = useCallback(async (isInitialLoad = false) => {
        if (!currentVendor) return;
        
        if (isInitialLoad) {
            setIsInitialLoading(true);
        }
        setError('');
        
        try {
            const statusesToFetch: Array<Order['status'] | 'New'> = ['New', 'Preparing', 'On its way'];
            const data = await api.getVendorOrders(currentVendor.id, statusesToFetch);
            
            // Notification Logic
            if (!isInitialLoad) {
                data.forEach(order => {
                    if (!previousOrderIdsRef.current.has(order.id) && order.status === 'Placed') {
                        sendNotification(`New Order from ${order.customerName}`, {
                            body: `Total: ৳${order.total.toFixed(2)}. Click to view.`,
                            tag: order.id
                        });
                    }
                });
            }
            
            // Update known IDs
            previousOrderIdsRef.current = new Set(data.map(o => o.id));

            data.sort((a, b) => {
                if (a.status === 'Placed' && b.status !== 'Placed') return -1;
                if (a.status !== 'Placed' && b.status === 'Placed') return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders.');
        } finally {
            if (isInitialLoad) {
                setIsInitialLoading(false);
            }
        }
    }, [currentVendor, sendNotification]);

    useEffect(() => {
        fetchOrders(true); // Initial fetch
        const intervalId = setInterval(() => fetchOrders(false), 10000); // Poll for new orders every 10s
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [fetchOrders]);
    
    const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
        setUpdatingOrderId(orderId);
        try {
            await api.updateOrderStatus(orderId, newStatus);
            await fetchOrders(false); // Refetch orders immediately to reflect the change
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update order status.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const renderContent = () => {
        if (isInitialLoading) {
            return (
                <>
                    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                         <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-left">Order Details</th>
                                    <th className="p-4 text-left">Customer</th>
                                    <th className="p-4 text-left">Total</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} />)}
                            </tbody>
                         </table>
                    </div>
                    <div className="md:hidden space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </>
            );
        }
        if (error) {
            return <div className="p-6 text-center text-red-500 bg-white rounded-lg shadow">{error}</div>;
        }
        if (orders.length === 0) {
            return (
                <EmptyState 
                    title="No active orders"
                    description="New orders will appear here when customers place them."
                    icon={<DashboardIcon className="w-12 h-12" />}
                />
            );
        }
        return (
            <>
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block bg-white rounded-lg shadow-md">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Order Details</th>
                                <th className="p-4 font-semibold text-gray-600">Customer</th>
                                <th className="p-4 font-semibold text-gray-600">Total</th>
                                <th className="p-4 font-semibold text-right text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr className="border-b last:border-0 hover:bg-gray-50 animate-fade-in-up transition-colors">
                                         <td className="p-4 align-top">
                                            <OrderStatusBadge status={order.status} />
                                            {order.status === 'On its way' && order.estimatedDeliveryTime && (
                                                <div className="mt-2 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 inline-block">
                                                    ETA: {calculateETA(order.estimatedDeliveryTime)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-mono text-sm text-blue-600 font-semibold">{order.id.split('-')[1]}</div>
                                            <div className="text-xs text-gray-500">{order.date}</div>
                                            <ul className="text-sm mt-2 space-y-2">
                                                {order.items.map(item => (
                                                    <li key={item.cartItemId} className="flex items-center space-x-2">
                                                        <img src={item.baseItem.imageUrl} alt={item.baseItem.name} className="w-10 h-10 rounded object-cover bg-gray-100" />
                                                        <div>
                                                            <span className="font-medium">{item.quantity} x {item.baseItem.name}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-semibold text-gray-800">{order.customerName}</div>
                                            <div className="text-sm text-gray-500 max-w-xs truncate">{order.address.details}</div>
                                        </td>
                                        <td className="p-4 align-top font-bold text-gray-800">৳{order.total.toFixed(2)}</td>
                                        <td className="p-4 align-top text-right">
                                            <div className="flex flex-col items-end space-y-2">
                                                <OrderStatusButton 
                                                    order={order} 
                                                    onUpdate={handleUpdateStatus} 
                                                    isUpdating={updatingOrderId === order.id}
                                                />
                                                 {order.status === 'On its way' && order.riderId && (
                                                    <button onClick={() => toggleTrackingMap(order.id)} className="flex items-center space-x-2 px-3 py-1 text-xs font-semibold rounded-full transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                        <MapPinIcon className="w-3 h-3" />
                                                        <span>{expandedOrderId === order.id ? 'Hide Map' : 'Track Rider'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order.id && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={5} className="p-0 sm:p-4">
                                                <RiderTrackingMap order={order} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                    {orders.map(order => (
                        <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm animate-fade-in-up">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <OrderStatusBadge status={order.status} />
                                    <div className="font-mono text-xs text-blue-600 mt-1">{order.id.split('-')[1]}</div>
                                    {order.status === 'On its way' && order.estimatedDeliveryTime && (
                                        <div className="mt-2 text-xs font-bold text-purple-700">
                                            ETA: {calculateETA(order.estimatedDeliveryTime)}
                                        </div>
                                    )}
                                </div>
                                <div className="font-bold text-lg">৳{order.total.toFixed(2)}</div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="font-semibold text-gray-800">{order.customerName}</div>
                                <div className="text-xs text-gray-500">{order.date}</div>
                            </div>

                            <ul className="text-sm bg-gray-50 p-2 rounded-md space-y-2">
                                {order.items.map(item => (
                                    <li key={item.cartItemId} className="flex items-center space-x-3">
                                        <img src={item.baseItem.imageUrl} alt={item.baseItem.name} className="w-10 h-10 rounded-md object-cover" />
                                        <div className="flex-1">
                                            <span className="font-medium">{item.quantity} x {item.baseItem.name}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            
                             <div className="mt-4 pt-3 border-t flex justify-between items-center">
                                {order.status === 'On its way' && order.riderId ? (
                                    <button onClick={() => toggleTrackingMap(order.id)} className="p-2 text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100">
                                        <MapPinIcon className="w-5 h-5" />
                                    </button>
                                ) : <div></div>}
                                
                                <OrderStatusButton 
                                    order={order} 
                                    onUpdate={handleUpdateStatus} 
                                    isUpdating={updatingOrderId === order.id}
                                />
                            </div>
                             {expandedOrderId === order.id && (
                                <div className="mt-4">
                                    <RiderTrackingMap order={order} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {permission === 'default' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 flex justify-between items-center animate-fade-in-up">
                    <div className="flex items-center">
                        <BellIcon className="w-6 h-6 text-blue-500 mr-2" />
                        <div>
                            <p className="text-sm text-blue-700 font-bold">Don't miss an order!</p>
                            <p className="text-xs text-blue-600">Enable desktop notifications to get alerted when new orders arrive.</p>
                        </div>
                    </div>
                    <button 
                        onClick={requestPermission}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded hover:bg-blue-600 transition"
                    >
                        Enable Notifications
                    </button>
                </div>
            )}

            <h1 className="text-2xl font-bold text-gray-800">Active Orders</h1>
            {renderContent()}
        </div>
    );
};

export default DashboardPage;
