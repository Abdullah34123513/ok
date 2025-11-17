import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { ModeratorDashboardSummary, Restaurant, SupportTicket } from '@shared/types';
import StatCard from '../components/StatCard';
import LiveRiderMap from '../components/LiveRiderMap';
import { UsersIcon, PlusCircleIcon, ClockIcon, CheckCircleIcon, XCircleIcon, SupportIcon, StarIcon } from '../components/Icons';

const DashboardPage: React.FC = () => {
    const [summary, setSummary] = useState<ModeratorDashboardSummary | null>(null);
    const [topVendors, setTopVendors] = useState<Pick<Restaurant, 'id' | 'name' | 'rating' | 'logoUrl'>[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [summaryData, vendorsData, ticketsData] = await Promise.all([
                    api.getModeratorDashboardSummary(),
                    api.getTopVendorsForModerator(),
                    api.getOpenSupportTickets(),
                ]);
                setSummary(summaryData);
                setTopVendors(vendorsData);
                setTickets(ticketsData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 bg-gray-50">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Active Riders" value={summary?.activeRiders ?? 0} icon={UsersIcon} color="#FF6B00" />
                <StatCard title="New Orders Today" value={summary?.newOrdersToday ?? 0} icon={PlusCircleIcon} color="#3B82F6" />
                <StatCard title="Ongoing Orders" value={summary?.ongoingOrders ?? 0} icon={ClockIcon} color="#F59E0B" />
                <StatCard title="Completed Orders" value={summary?.completedOrders ?? 0} icon={CheckCircleIcon} color="#10B981" />
                <StatCard title="Cancelled Orders" value={summary?.cancelledOrders ?? 0} icon={XCircleIcon} color="#EF4444" />
                <StatCard title="Open Tickets" value={summary?.openSupportTickets ?? 0} icon={SupportIcon} color="#8B5CF6" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
                     <h2 className="text-xl font-bold text-gray-800 mb-4">Live Rider Activity</h2>
                     <LiveRiderMap />
                </div>
                <div className="space-y-6">
                    {/* Top Vendors */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Vendors</h2>
                        <div className="space-y-3">
                            {topVendors.map(vendor => (
                                <div key={vendor.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                                    <img src={vendor.logoUrl} alt={vendor.name} className="w-10 h-10 rounded-full object-cover"/>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{vendor.name}</p>
                                    </div>
                                    <div className="flex items-center text-sm font-bold">
                                        <StarIcon className="w-4 h-4 text-yellow-400 mr-1"/>
                                        {vendor.rating.toFixed(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     {/* Open Support Tickets */}
                    <div className="bg-white p-4 rounded-lg shadow">
                         <h2 className="text-xl font-bold text-gray-800 mb-4">Open Support Tickets</h2>
                          <div className="space-y-3">
                            {tickets.map(ticket => (
                                <div key={ticket.id} className="p-2 rounded-md hover:bg-gray-50">
                                    <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                        <span>{ticket.userEmail}</span>
                                        <span className={`font-semibold px-2 py-0.5 rounded-full ${ticket.status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{ticket.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;