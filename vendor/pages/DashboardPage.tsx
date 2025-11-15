
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '@shared/types';
import RiderTrackingMap from '../components/RiderTrackingMap';
import { MapPinIcon } from '../components/Icons';

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


const DashboardPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
    }, [currentVendor]);

    useEffect(() => {
        fetchOrders(true); // Initial fetch
        const intervalId = setInterval(() => fetchOrders(false), 30000); // Poll for new orders
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
            return <div className="p-6 text-center text-gray-500">Loading active orders...</div>;
        }
        if (error) {
            return <div className="p-6 text-center text-red-500">{error}</div>;
        }
        if (orders.length === 0) {
            return <div className="p-6 text-center text-gray-500">No active orders right now.</div>;
        }
        return (
            <>
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="bg-gray-50">
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Order Details</th>
                                <th className="p-4 font-semibold">Customer</th>
                                <th className="p-4 font-semibold">Total</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr className="border-b last:border-0 hover:bg-gray-50 animate-fade-in-up">
                                         <td className="p-4 align-top">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-mono text-sm text-blue-600 font-semibold">{order.id.split('-')[1]}</div>
                                            <div className="text-xs text-gray-500">{order.date}</div>
                                            <ul className="text-sm mt-2 space-y-2">
                                                {order.items.map(item => (
                                                    <li key={item.cartItemId} className="flex items-center space-x-2">
                                                        <img src={item.baseItem.imageUrl} alt={item.baseItem.name} className="w-12 h-12 rounded object-cover" />
                                                        <div>
                                                            <span>{item.quantity} x {item.baseItem.name}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-semibold">{order.customerName}</div>
                                            <div className="text-sm text-gray-600">{order.address.details}</div>
                                        </td>
                                        <td className="p-4 align-top font-semibold text-lg">৳{order.total.toFixed(2)}</td>
                                        <td className="p-4 align-top text-right">
                                            <div className="flex flex-col items-end space-y-2">
                                                <OrderStatusButton 
                                                    order={order} 
                                                    onUpdate={handleUpdateStatus} 
                                                    isUpdating={updatingOrderId === order.id}
                                                />
                                                 {order.status === 'On its way' && order.riderId && (
                                                    <button onClick={() => toggleTrackingMap(order.id)} className="flex items-center space-x-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors bg-purple-500 text-white hover:bg-purple-600">
                                                        <MapPinIcon className="w-4 h-4" />
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
                <div className="space-y-4 md:hidden p-4">
                    {orders.map(order => (
                        <div key={order.id} className="border rounded-lg p-4 bg-white shadow animate-fade-in-up">
                            <div className="flex justify-between items-start">
                                <div>
                                    <OrderStatusBadge status={order.status} />
                                    <div className="font-semibold mt-2">{order.customerName}</div>
                                    <div className="font-mono text-sm text-blue-600">{order.id.split('-')[1]}</div>
                                    <div className="text-xs text-gray-500">{order.date}</div>
                                </div>
                                <div className="font-semibold text-lg">৳{order.total.toFixed(2)}</div>
                            </div>
                            <ul className="text-sm mt-2 space-y-2 border-t pt-2">
                                {order.items.map(item => (
                                    <li key={item.cartItemId} className="flex items-center space-x-3">
                                        <img src={item.baseItem.imageUrl} alt={item.baseItem.name} className="w-14 h-14 rounded-md object-cover" />
                                        <div>
                                            <span>{item.quantity} x {item.baseItem.name}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                             <div className="mt-4 pt-2 border-t flex flex-col items-end space-y-2">
                                <OrderStatusButton 
                                    order={order} 
                                    onUpdate={handleUpdateStatus} 
                                    isUpdating={updatingOrderId === order.id}
                                />
                                {order.status === 'On its way' && order.riderId && (
                                    <button onClick={() => toggleTrackingMap(order.id)} className="flex items-center space-x-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors bg-purple-500 text-white hover:bg-purple-600">
                                        <MapPinIcon className="w-4 h-4" />
                                        <span>{expandedOrderId === order.id ? 'Hide Map' : 'Track Rider'}</span>
                                    </button>
                                )}
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
            <h1 className="text-2xl font-bold text-gray-800">Active Orders</h1>
            
            <div className="bg-white rounded-lg shadow-md">
                {renderContent()}
            </div>
        </div>
    );
};

export default DashboardPage;