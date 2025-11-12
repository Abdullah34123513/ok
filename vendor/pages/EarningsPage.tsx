import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { VendorDashboardSummary } from '@shared/types';
import StatCard from '../components/StatCard';
import { RevenueIcon, TotalOrdersIcon, RatingIcon } from '../components/Icons';

const EarningsPage: React.FC = () => {
    const { currentVendor } = useAuth();
    const [summary, setSummary] = useState<VendorDashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentVendor) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const summaryData = await api.getVendorDashboardSummary(currentVendor.id);
                setSummary(summaryData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load earnings data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentVendor]);

    if (isLoading) {
        return <div className="p-6">Loading earnings summary...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Earnings Summary</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={`$${summary?.totalRevenue.toFixed(2)}`} icon={RevenueIcon} color="#10B981" />
                <StatCard title="Total Orders" value={summary?.totalOrders ?? 0} icon={TotalOrdersIcon} color="#3B82F6" />
                <StatCard title="Average Rating" value={summary?.averageItemRating.toFixed(1) ?? 'N/A'} icon={RatingIcon} color="#EF4444" />
            </div>

            {/* Placeholder for future charts and reports */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Reports</h2>
                <p className="text-gray-500">More detailed financial charts and downloadable reports will be available here soon.</p>
            </div>
        </div>
    );
};

export default EarningsPage;