import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '@shared/api';
import type { Order } from '@shared/types';
import OrderCard from '../components/OrderCard';
import AddOrderNoteModal from '../components/AddOrderNoteModal';

type OrderTab = 'New' | 'Preparing' | 'On its way';

const DashboardPage: React.FC = () => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<OrderTab>('New');
    const [noteModalOrder, setNoteModalOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setIsLoading(true);
        setError('');
        try {
            const data = await api.getModeratorAllOngoingOrders();
            setAllOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders.');
        } finally {
            if (isInitialLoad) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(true);
        const interval = setInterval(() => fetchOrders(false), 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, [fetchOrders]);
    
    const handleUpdateStatus = async (orderId: string, newStatus: Order['status'], note: string) => {
        const originalOrders = [...allOrders];
        setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        try {
            await api.updateOrderStatusByModerator(orderId, newStatus, note);
            await fetchOrders();
        } catch (err) {
            setError('Failed to update status.');
            setAllOrders(originalOrders);
        }
    };
    
    const handleSaveNote = async (orderId: string, note: string) => {
        const originalOrders = [...allOrders];
         setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, moderatorNote: note } : o));
         setNoteModalOrder(null);
        try {
            const orderToUpdate = originalOrders.find(o => o.id === orderId);
            if(orderToUpdate) {
                await api.updateOrderStatusByModerator(orderId, orderToUpdate.status, note);
                await fetchOrders();
            }
        } catch (err) {
             setError('Failed to save note.');
             setAllOrders(originalOrders);
        }
    };

    const filteredOrders = useMemo(() => {
        const statusMap: Record<OrderTab, Array<Order['status']>> = {
            'New': ['Placed'],
            'Preparing': ['Preparing'],
            'On its way': ['On its way'],
        };
        return allOrders.filter(o => statusMap[activeTab].includes(o.status));
    }, [allOrders, activeTab]);

    const tabs: { id: OrderTab, label: string }[] = [
        { id: 'New', label: 'New Orders' },
        { id: 'Preparing', label: 'Preparing' },
        { id: 'On its way', label: 'Out for Delivery' },
    ];

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8">Loading live orders...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-500">{error}</div>;
        }
        if (filteredOrders.length === 0) {
            return <div className="text-center p-8 text-gray-500">No orders in this category right now.</div>;
        }
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdate={handleUpdateStatus}
                        onAddNote={setNoteModalOrder}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="p-4 sm:p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Live Order Management</h1>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                {renderContent()}
            </div>
            {noteModalOrder && (
                <AddOrderNoteModal
                    order={noteModalOrder}
                    onClose={() => setNoteModalOrder(null)}
                    onSave={handleSaveNote}
                />
            )}
        </>
    );
};

export default DashboardPage;
