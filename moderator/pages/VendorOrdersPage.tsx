import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '@shared/api';
import type { Order, Vendor } from '@shared/types';
import { ChatBubbleIcon, ClockIcon } from '../components/Icons';
import AddOrderNoteModal from '../components/AddOrderNoteModal';

type OrderTab = 'New' | 'Preparing' | 'On its way' | 'Delivered' | 'Cancelled';

const UNACCEPTED_DELAY_MINUTES = 5;
const PREPARATION_DELAY_MINUTES = 15;

const OrderCard: React.FC<{
    order: Order;
    onUpdate: (orderId: string, status: Order['status'], note: string) => void;
    onAddNote: (order: Order) => void;
}> = ({ order, onUpdate, onAddNote }) => {

    const { isUnacceptedDelayed, isPreparationDelayed } = useMemo(() => {
        const now = Date.now();
        const unaccepted = order.status === 'Placed' && order.placedAt && (now - new Date(order.placedAt).getTime()) > UNACCEPTED_DELAY_MINUTES * 60 * 1000;
        const preparing = order.status === 'Preparing' && order.acceptedAt && (now - new Date(order.acceptedAt).getTime()) > PREPARATION_DELAY_MINUTES * 60 * 1000;
        return { isUnacceptedDelayed: unaccepted, isPreparationDelayed: preparing };
    }, [order.status, order.placedAt, order.acceptedAt]);

    const getBorderClass = () => {
        if (isUnacceptedDelayed) return 'border-yellow-500 bg-yellow-50';
        if (isPreparationDelayed) return 'border-red-500 bg-red-50';
        return 'border-gray-200';
    };

    const ActionButtons = () => {
        switch (order.status) {
            case 'Placed':
                return (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => onUpdate(order.id, 'Cancelled', `[MOD ACTION]: Order cancelled.`)} className="px-3 py-1 text-sm font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200">Cancel</button>
                        <button onClick={() => onUpdate(order.id, 'Preparing', `[MOD ACTION]: Order accepted.`)} className="px-3 py-1 text-sm font-semibold rounded-md bg-green-500 text-white hover:bg-green-600">Accept</button>
                    </div>
                );
            case 'Preparing':
                return (
                    <div className="flex items-center space-x-2">
                         <button onClick={() => onUpdate(order.id, 'Cancelled', `[MOD ACTION]: Order cancelled during preparation.`)} className="px-3 py-1 text-sm font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200">Cancel</button>
                        <button onClick={() => onUpdate(order.id, 'On its way', `[MOD ACTION]: Marked as ready for pickup.`)} className="px-3 py-1 text-sm font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600">Mark as Ready</button>
                    </div>
                );
            case 'On its way':
                 return <button onClick={() => onUpdate(order.id, 'Delivered', `[MOD ACTION]: Marked as delivered.`)} className="px-3 py-1 text-sm font-semibold rounded-md bg-green-500 text-white hover:bg-green-600">Mark Delivered</button>;
            default:
                return <span className="text-sm font-semibold text-gray-500">{order.status}</span>;
        }
    };

    return (
        <div className={`bg-white p-4 rounded-lg shadow border-l-4 ${getBorderClass()}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                    <div className="font-bold text-gray-800">{order.customerName}</div>
                    <div className="font-mono text-sm text-blue-600">{order.id.split('-')[1]}</div>
                    <div className="text-xs text-gray-500">{new Date(order.placedAt || order.date).toLocaleString()}</div>
                     {(isUnacceptedDelayed || isPreparationDelayed) && (
                        <div className="mt-2 flex items-center text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md">
                            <ClockIcon className="w-4 h-4 mr-1"/>
                            {isUnacceptedDelayed ? `Unaccepted for over ${UNACCEPTED_DELAY_MINUTES} mins` : `In preparation for over ${PREPARATION_DELAY_MINUTES} mins`}
                        </div>
                     )}
                </div>
                <div className="font-semibold text-lg text-right sm:text-left">৳{order.total.toFixed(2)}</div>
            </div>
            <ul className="text-sm mt-2 space-y-1 border-t pt-2">
                {order.items.map(item => <li key={item.cartItemId}>{item.quantity} x {item.baseItem.name}</li>)}
            </ul>
            {order.moderatorNote && (
                <div className="mt-2 p-2 bg-gray-100 rounded-md text-xs italic text-gray-600">
                    <strong>Mod Note:</strong> {order.moderatorNote}
                </div>
            )}
            <div className="mt-4 pt-2 border-t flex flex-col sm:flex-row justify-between items-center gap-2">
                <button onClick={() => onAddNote(order)} className="flex items-center space-x-2 text-sm text-gray-600 font-medium hover:text-blue-600 transition">
                    <ChatBubbleIcon className="w-5 h-5"/>
                    <span>{order.moderatorNote ? 'Edit Note' : 'Add Note'}</span>
                </button>
                <ActionButtons />
            </div>
        </div>
    );
};


const VendorOrdersPage: React.FC<{ vendorId: string }> = ({ vendorId }) => {
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<OrderTab>('New');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [noteModalOrder, setNoteModalOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        setError('');
        try {
            const data = await api.getOrdersForVendorByModerator(vendorId);
            setOrders(data.sort((a, b) => new Date(b.placedAt || b.date).getTime() - new Date(a.placedAt || a.date).getTime()));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders.');
        } finally {
            setIsLoading(false);
        }
    }, [vendorId]);

    useEffect(() => {
        api.getVendorDetailsForModerator(vendorId).then(data => {
            if (data) setVendor(data.vendor);
        });
        fetchOrders();
    }, [vendorId, fetchOrders]);

    const handleUpdateStatus = async (orderId: string, newStatus: Order['status'], note: string) => {
        const originalOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        try {
            await api.updateOrderStatusByModerator(orderId, newStatus, note);
            await fetchOrders();
        } catch (err) {
            setError('Failed to update status.');
            setOrders(originalOrders);
        }
    };
    
    const handleSaveNote = async (orderId: string, note: string) => {
        const originalOrders = [...orders];
         setOrders(prev => prev.map(o => o.id === orderId ? { ...o, moderatorNote: note } : o));
         setNoteModalOrder(null);
        try {
            const orderToUpdate = originalOrders.find(o => o.id === orderId);
            if(orderToUpdate) {
                await api.updateOrderStatusByModerator(orderId, orderToUpdate.status, note);
                await fetchOrders();
            }
        } catch (err) {
             setError('Failed to save note.');
             setOrders(originalOrders);
        }
    };

    const filteredOrders = useMemo(() => {
        const statusMap: Record<OrderTab, Array<Order['status']>> = {
            'New': ['Placed'],
            'Preparing': ['Preparing'],
            'On its way': ['On its way'],
            'Delivered': ['Delivered'],
            'Cancelled': ['Cancelled'],
        };
        const targetStatuses = statusMap[activeTab];
        return orders.filter(o => targetStatuses.includes(o.status));
    }, [orders, activeTab]);

    const tabs: OrderTab[] = ['New', 'Preparing', 'On its way', 'Delivered', 'Cancelled'];

    return (
        <>
            <div className="p-6 space-y-6">
                <div>
                    <a href={`#/vendors`} className="text-sm text-blue-600 hover:underline">&larr; Back to All Vendors</a>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Orders for {vendor?.name || '...'}</h1>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {isLoading ? <div className="text-center p-8">Loading orders...</div>
                 : error ? <div className="text-center p-8 text-red-500">{error}</div>
                 : filteredOrders.length === 0 ? <div className="text-center p-8 text-gray-500">No orders in this category.</div>
                 : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} onUpdate={handleUpdateStatus} onAddNote={setNoteModalOrder} />
                        ))}
                    </div>
                 )
                }
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

export default VendorOrdersPage;