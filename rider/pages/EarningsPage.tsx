import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { RiderStats } from '@shared/types';
import { MoneyIcon, PackageIcon, StarIcon } from '../components/Icons';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center" style={{ borderLeft: `5px solid ${color}` }}>
        {/* FIX: Moved color style to the parent div to be inherited by the icon's `currentColor` property, resolving the type error. */}
        <div className={`p-3 rounded-full mr-4`} style={{ backgroundColor: `${color}20`, color: color }}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
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

        const fetchStats = async () => {
            setIsLoading(true);
            setError('');
            try {
                const data = await api.getRiderStats(currentRider.id);
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load stats.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [currentRider]);

    return (
        <div>
            <header className="bg-white text-gray-800 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 text-center">
                    <h1 className="text-xl font-bold">Earnings</h1>
                </div>
            </header>
            <main className="p-4">
                {isLoading ? (
                    <div className="text-center p-8 text-gray-500">Loading stats...</div>
                ) : error ? (
                    <div className="text-center p-8 text-red-500">{error}</div>
                ) : stats ? (
                    <div className="space-y-4">
                        <StatCard title="Today's Earnings" value={`৳${stats.todayEarnings.toFixed(2)}`} icon={MoneyIcon} color="#10B981" />
                        <StatCard title="Completed Trips" value={stats.completedTrips} icon={PackageIcon} color="#3B82F6" />
                        <StatCard title="Your Rating" value={stats.rating.toFixed(1)} icon={StarIcon} color="#F59E0B" />
                    </div>
                ) : (
                    <div className="text-center p-8 text-gray-500">No stats available.</div>
                )}
            </main>
        </div>
    );
};

export default EarningsPage;