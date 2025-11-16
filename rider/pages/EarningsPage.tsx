import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { RiderStats } from '@shared/types';
import { EarningsIcon, PackageIcon, ClockIcon } from '../components/Icons';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ComponentType<{ className?: string }> }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border flex items-center">
        <div className="p-3 bg-gray-100 rounded-full mr-4">
            <Icon className="w-7 h-7 text-[#FF6B00]" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const EarningsPage: React.FC = () => {
    const { currentRider } = useAuth();
    const [stats, setStats] = useState<RiderStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentRider) return;
        setIsLoading(true);
        setError('');
        api.getRiderStats(currentRider.id)
            .then(setStats)
            .catch(() => setError('Could not load earnings data.'))
            .finally(() => setIsLoading(false));
    }, [currentRider]);
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center text-gray-500">Loading earnings...</div>;
        }
        if (error) {
            return <div className="text-center text-red-500">{error}</div>;
        }
        if (!stats) {
            return <div className="text-center text-gray-500">No earnings data available.</div>;
        }

        return (
            <div className="space-y-5">
                <StatCard title="Today's Earnings" value={`৳${stats.todayEarnings.toFixed(2)}`} icon={EarningsIcon} />
                <StatCard title="Completed Trips" value={stats.completedTrips} icon={PackageIcon} />
                <StatCard title="Online Hours" value={`${stats.onlineHours.toFixed(1)}h`} icon={ClockIcon} />
            </div>
        );
    };

    return (
        <div className="p-4 space-y-4 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 px-2">Earnings Summary</h2>
            {renderContent()}
        </div>
    );
};

export default EarningsPage;