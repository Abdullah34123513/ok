import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { VendorDashboardSummary, Order } from '../../types';
import StatCard from '../components/StatCard';
import { RevenueIcon, TotalOrdersIcon, ActiveOrdersIcon, RatingIcon } from '../components/Icons';

const DashboardPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const [summary, setSummary] = useState<VendorDashboardSummary | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentVendor) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [summaryData, ordersData] = await Promise.all([
                    api.getVendorDashboardSummary(currentVendor.id),
                    api.getVendorOrders(currentVendor.id, 'New'),
                ]);
                setSummary(summaryData);
                setRecentOrders(ordersData);
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
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`$${summary?.totalRevenue.toFixed(2)}`} icon={RevenueIcon} color="#10B981" />
                <StatCard title="Total Orders" value={summary?.totalOrders ?? 0} icon={TotalOrdersIcon} color="#3B82F6" />
                <StatCard title="Active Orders" value={summary?.activeOrders ?? 0} icon={ActiveOrdersIcon} color="#F59E0B" />
                <StatCard title="Average Rating" value={summary?.averageItemRating.toFixed(1) ?? 'N/A'} icon={RatingIcon} color="#EF4444" />
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">New Orders</h2>
                <div className="overflow-x-auto">
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
                            {recentOrders.length > 0 ? recentOrders.map(order => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-mono text-sm text-blue-600">{order.id.split('-')[1]}</td>
                                    <td className="p-3">{order.customerName}</td>
                                    <td className="p-3 font-semibold">${order.total.toFixed(2)}</td>
                                    <td className="p-3">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                    <td className="p-3">
                                        <a href="#/orders" className="text-blue-500 hover:underline font-semibold">View</a>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-gray-500">No new orders right now.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
