import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@shared/api';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '@shared/types';

type HistoryFilter = 'delivered' | 'cancelled';

const HistoryPage: React.FC = () => {
    const { currentRider } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<HistoryFilter>('delivered');
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        if (!currentRider) return;
        setIsLoading(true);
        try {
            const data = filter === 'delivered'
                ? await api.getRiderDeliveredOrders(currentRider.id)
                : await api.getRiderCancelledOrders(currentRider.id);
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [currentRider, filter]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    return (
        <div>
             <header className="bg-white text-gray-800 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 text-center">
                    <h1 className="text-xl font-bold">Order History</h1>
                </div>
            </header>
            <nav className="border-b bg-white">
                <div className="container mx-auto flex">
                    <button onClick={() => setFilter('delivered')} className={`flex-1 py-3 font-semibold transition-colors ${filter === 'delivered' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-gray-500'}`}>Completed</button>
                    <button onClick={() => setFilter('cancelled')} className={`flex-1 py-3 font-semibold transition-colors ${filter === 'cancelled' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-gray-500'}`}>Cancelled</button>
                </div>
            </nav>
            <main className="p-4 space-y-3">
                {isLoading ? (
                    <div className="text-center p-8 text-gray-500">Loading history...</div>
                ) : orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">{order.restaurantName}</p>
                                    <p className="text-xs text-gray-500">{order.date}</p>
                                    <p className="text-xs text-gray-500">Order #{order.id.split('-')[1]}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-green-600">+ ৳{order.deliveryFee.toFixed(2)}</p>
                                    <p className="text-sm font-semibold text-gray-600">{order.status}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500">No {filter} orders found.</div>
                )}
            </main>
        </div>
    );
};

export default HistoryPage;
