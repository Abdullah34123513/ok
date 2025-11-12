import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '@shared/types';

const OrderList: React.FC<{ title: string, orders: Order[] }> = ({ title, orders }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-3 font-semibold">Order ID</th>
                        <th className="p-3 font-semibold">Customer</th>
                        <th className="p-3 font-semibold">Total</th>
                        <th className="p-3 font-semibold">Items</th>
                        <th className="p-3 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? orders.map(order => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-sm text-blue-600">{order.id.split('-')[1]}</td>
                            <td className="p-3">{order.customerName}</td>
                            <td className="p-3 font-semibold">${order.total.toFixed(2)}</td>
                            <td className="p-3">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                            <td className="p-3">
                                <a href="#/orders" className="text-blue-500 hover:underline font-semibold">View Details</a>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="p-6 text-center text-gray-500">No orders in this category.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
             {orders.length > 0 ? orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-bold">{order.customerName}</div>
                            <div className="font-mono text-sm text-blue-600">{order.id.split('-')[1]}</div>
                        </div>
                        <div className="font-semibold text-lg">${order.total.toFixed(2)}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                    </div>
                    <div className="mt-3 text-right">
                        <a href="#/orders" className="text-blue-500 hover:underline font-semibold">View Order</a>
                    </div>
                </div>
            )) : (
                <div className="p-6 text-center text-gray-500">No orders in this category.</div>
            )}
        </div>
    </div>
);


const DashboardPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const [newOrders, setNewOrders] = useState<Order[]>([]);
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentVendor) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [newOrdersData, pendingOrdersData] = await Promise.all([
                    api.getVendorOrders(currentVendor.id, 'New'),
                    api.getVendorOrders(currentVendor.id, 'Preparing'),
                ]);
                setNewOrders(newOrdersData);
                setPendingOrders(pendingOrdersData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentVendor]);

    if (isLoading) {
        return <div className="p-6">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Order Overview</h1>

            <OrderList title="New Orders" orders={newOrders} />
            <OrderList title="Pending Orders (Preparing)" orders={pendingOrders} />
        </div>
    );
};

export default DashboardPage;