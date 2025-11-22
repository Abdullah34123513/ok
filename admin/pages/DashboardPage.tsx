
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { AdminDashboardSummary } from '@shared/types';

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</p>
    </div>
);

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<AdminDashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getAdminDashboardSummary()
            .then(setStats)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!stats) return <div className="p-8">Failed to load stats.</div>;

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">System Overview</h1>
                    <p className="text-gray-500 mt-1">Real-time metrics across the entire platform.</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    System Status: Healthy
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`৳${stats.totalRevenue.toFixed(2)}`} color="text-emerald-600" />
                <StatCard title="Net Profit (Est.)" value={`৳${stats.netProfit.toFixed(2)}`} color="text-blue-600" />
                <StatCard title="Total Orders" value={stats.totalOrders} color="text-indigo-600" />
                <StatCard title="Active Users" value={stats.activeUsers} color="text-purple-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Operational Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <span className="text-gray-600">Active Vendors</span>
                            <span className="font-bold text-gray-900">{stats.activeVendors}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-3">
                            <span className="text-gray-600">Online Riders</span>
                            <span className="font-bold text-gray-900">{stats.activeRiders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Avg Order Value</span>
                            <span className="font-bold text-gray-900">৳{(stats.totalRevenue / stats.totalOrders).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-indigo-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-center items-center text-center">
                    <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
                    <p className="text-indigo-100 mb-6">Manage system resources directly.</p>
                    <div className="flex space-x-3">
                        <a href="#/finance" className="px-4 py-2 bg-white text-indigo-600 font-bold rounded hover:bg-indigo-50 transition">View Cashflow</a>
                        <a href="#/moderators" className="px-4 py-2 bg-indigo-800 text-white font-bold rounded hover:bg-indigo-900 transition">Add Moderator</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
