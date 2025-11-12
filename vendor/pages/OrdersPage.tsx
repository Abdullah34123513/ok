import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '@shared/types';

type OrderTab = 'New' | 'Preparing' | 'On its way' | 'Delivered' | 'Cancelled';

const OrderStatusButton: React.FC<{ order: Order, onUpdate: (orderId: string, status: Order['status']) => void, className?: string }> = ({ order, onUpdate, className }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleClick = async (newStatus: Order['status']) => {
        setIsLoading(true);
        await onUpdate(order.id, newStatus);
        setIsLoading(false);
    };

    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-md transition-colors disabled:opacity-50";

    switch (order.status) {
        case 'Placed':
            return <button onClick={() => handleClick('Preparing')} disabled={isLoading} className={`${baseClasses} bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 ${className}`}>Accept Order</button>;
        case 'Preparing':
            return <button onClick={() => handleClick('On its way')} disabled={isLoading} className={`${baseClasses} bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300 ${className}`}>Mark as Ready</button>;
        case 'On its way':
             return <button onClick={() => handleClick('Delivered')} disabled={isLoading} className={`${baseClasses} bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300 ${className}`}>Mark Delivered</button>;
        default:
            return <span className={`px-3 py-1 text-sm text-gray-500 ${className}`}>{order.status}</span>;
    }
};


const OrdersPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const [activeTab, setActiveTab] = useState<OrderTab>('New');
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderCounts, setOrderCounts] = useState<Record<string, number> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = useCallback(async () => {
        if (!currentVendor) return;
        setIsLoading(true);
        setError('');
        try {
            const statusToFetch = activeTab === 'New' ? 'Placed' : activeTab;
            const data = await api.getVendorOrders(currentVendor.id, statusToFetch);
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders.');
        } finally {
            setIsLoading(false);
        }
    }, [currentVendor, activeTab]);

    const fetchCounts = useCallback(async () => {
        if (!currentVendor) return;
        try {
            const counts = await api.getVendorOrderCounts(currentVendor.id);
            setOrderCounts(counts);
        } catch (err) {
            console.error("Could not fetch order counts", err);
        }
    }, [currentVendor]);


    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);
    
    const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
        await api.updateOrderStatus(orderId, newStatus);
        // Refetch orders for the current tab to see the change
        fetchOrders();
        fetchCounts();
    };

    const tabs: OrderTab[] = ['New', 'Preparing', 'On its way', 'Delivered', 'Cancelled'];
    const tabColors: Record<OrderTab, string> = {
        'New': 'bg-blue-500',
        'Preparing': 'bg-yellow-500',
        'On its way': 'bg-purple-500',
        'Delivered': 'bg-green-500',
        'Cancelled': 'bg-gray-400',
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="p-6 text-center">Loading orders...</div>;
        }
        if (error) {
            return <div className="p-6 text-center text-red-500">{error}</div>;
        }
        if (orders.length === 0) {
            return <div className="p-6 text-center text-gray-500">No orders in this category.</div>;
        }
        return (
            <>
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="bg-gray-50">
                                <th className="p-4 font-semibold">Order Details</th>
                                <th className="p-4 font-semibold">Customer</th>
                                <th className="p-4 font-semibold">Total</th>
                                <th className="p-4 font-semibold">Status Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 align-top">
                                        <div className="font-mono text-sm text-blue-600 font-semibold">{order.id.split('-')[1]}</div>
                                        <div className="text-xs text-gray-500">{order.date}</div>
                                        <ul className="text-sm mt-2 space-y-1">
                                            {order.items.map(item => (
                                                <li key={item.cartItemId}>{item.quantity} x {item.baseItem.name}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="font-semibold">{order.customerName}</div>
                                        <div className="text-sm text-gray-600">{order.address.details}</div>
                                    </td>
                                    <td className="p-4 align-top font-semibold text-lg">${order.total.toFixed(2)}</td>
                                    <td className="p-4 align-top">
                                        <OrderStatusButton order={order} onUpdate={handleUpdateStatus} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden p-4">
                    {orders.map(order => (
                        <div key={order.id} className="border rounded-lg p-4 bg-white shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold">{order.customerName}</div>
                                    <div className="font-mono text-sm text-blue-600">{order.id.split('-')[1]}</div>
                                    <div className="text-xs text-gray-500">{order.date}</div>
                                </div>
                                <div className="font-semibold text-lg">${order.total.toFixed(2)}</div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">{order.address.details}</div>
                            <ul className="text-sm mt-2 space-y-1 border-t pt-2">
                                {order.items.map(item => (
                                    <li key={item.cartItemId}>{item.quantity} x {item.baseItem.name}</li>
                                ))}
                            </ul>
                            <div className="mt-4 text-right">
                                <OrderStatusButton order={order} onUpdate={handleUpdateStatus} />
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center space-x-2 whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                             <span className={`w-2 h-2 rounded-full ${tabColors[tab]}`}></span>
                             <span>{tab}</span>
                             {orderCounts && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {orderCounts[tab]}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="bg-white rounded-lg shadow-md">
                {renderContent()}
            </div>
        </div>
    );
};

export default OrdersPage;