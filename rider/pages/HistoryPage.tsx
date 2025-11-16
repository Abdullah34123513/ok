import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '@shared/types';

const HistoryCard: React.FC<{ order: Order }> = ({ order }) => {
    const isDelivered = order.status === 'Delivered';
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">{order.restaurantName}</p>
                    <p className="text-sm text-gray-500">Order #{order.id.split('-')[1]}</p>
                    <p className="text-xs text-gray-400">{order.date}</p>
                </div>
                <div className="text-right">
                    <p className={`font-bold text-lg ${isDelivered ? 'text-green-600' : 'text-red-600'}`}>
                        {isDelivered ? `+ ৳${order.deliveryFee.toFixed(2)}` : 'Cancelled'}
                    </p>
                    <p className={`text-sm font-semibold ${isDelivered ? 'text-green-500' : 'text-red-500'}`}>{order.status}</p>
                </div>
            </div>
        </div>
    );
};


const HistoryPage: React.FC = () => {
    const { currentRider } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentRider) return;
        setIsLoading(true);
        setError('');
        api.getRiderOrderHistory(currentRider.id)
            .then(setOrders)
            .catch(() => setError('Could not load order history.'))
            .finally(() => setIsLoading(false));
    }, [currentRider]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center text-gray-500">Loading history...</div>;
        }
        if (error) {
            return <div className="text-center text-red-500">{error}</div>;
        }
        if (orders.length === 0) {
            return <div className="text-center text-gray-500">No completed orders found.</div>;
        }
        return (
            <div className="space-y-4">
                {orders.map(order => <HistoryCard key={order.id} order={order} />)}
            </div>
        );
    };

    return (
        <div className="p-4 space-y-4 animate-fade-in-up">
             <h2 className="text-2xl font-bold text-gray-800 px-2">Order History</h2>
            {renderContent()}
        </div>
    );
};

export default HistoryPage;