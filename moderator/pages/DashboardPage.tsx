import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '@shared/api';
import type { Order } from '@shared/types';
import OrderCard from '../components/OrderCard';
import AddOrderNoteModal from '../components/AddOrderNoteModal';

const OrderColumn: React.FC<{
    title: string;
    orders: Order[];
    onUpdate: (orderId: string, status: Order['status'], note: string) => void;
    onAddNote: (order: Order) => void;
}> = ({ title, orders, onUpdate, onAddNote }) => (
    <div className="flex flex-col flex-shrink-0 w-full md:w-[380px] bg-gray-50 rounded-lg shadow-inner">
        <h2 className="font-bold text-lg text-gray-700 p-3 sticky top-0 bg-gray-100 z-10 border-b rounded-t-lg">{title} ({orders.length})</h2>
        <div className="p-3 space-y-4 overflow-y-auto">
            {orders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">No orders here.</p>
            ) : (
                orders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdate={onUpdate}
                        onAddNote={onAddNote}
                    />
                ))
            )}
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
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

    const { newOrders, preparingOrders, deliveryOrders } = useMemo(() => {
        const newO: Order[] = [];
        const prep: Order[] = [];
        const deli: Order[] = [];
        
        allOrders.forEach(o => {
            if (o.status === 'Placed') newO.push(o);
            else if (o.status === 'Preparing') prep.push(o);
            else if (o.status === 'On its way') deli.push(o);
        });

        return { newOrders: newO, preparingOrders: prep, deliveryOrders: deli };
    }, [allOrders]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8">Loading live orders...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-500">{error}</div>;
        }
        return (
            <div className="flex space-x-4 h-full pb-4">
                <OrderColumn title="New Orders" orders={newOrders} onUpdate={handleUpdateStatus} onAddNote={setNoteModalOrder} />
                <OrderColumn title="Preparing" orders={preparingOrders} onUpdate={handleUpdateStatus} onAddNote={setNoteModalOrder} />
                <OrderColumn title="Out for Delivery" orders={deliveryOrders} onUpdate={handleUpdateStatus} onAddNote={setNoteModalOrder} />
            </div>
        );
    };

    return (
        <>
            <div className="p-4 sm:p-6 flex flex-col h-[calc(100vh-80px)]">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 flex-shrink-0">Live Order Management</h1>
                <div className="flex-1 overflow-x-auto">
                   {renderContent()}
                </div>
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
