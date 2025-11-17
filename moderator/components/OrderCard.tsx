import React, { useMemo } from 'react';
import type { Order } from '@shared/types';
import { ChatBubbleIcon, ClockIcon, PhoneIcon } from './Icons';

interface OrderCardProps {
    order: Order;
    onUpdate: (orderId: string, status: Order['status'], note: string) => void;
    onAddNote: (order: Order) => void;
}

const UNACCEPTED_DELAY_MINUTES = 5;
const PREPARATION_DELAY_MINUTES = 15;

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdate, onAddNote }) => {

    const { isUnacceptedDelayed, isPreparationDelayed, timeElapsed } = useMemo(() => {
        const now = Date.now();
        let elapsed = '';
        
        const unaccepted = order.status === 'Placed' && order.placedAt && (now - new Date(order.placedAt).getTime()) > UNACCEPTED_DELAY_MINUTES * 60 * 1000;
        if (order.status === 'Placed' && order.placedAt) {
            elapsed = `${Math.round((now - new Date(order.placedAt).getTime()) / 60000)}m ago`;
        }
        
        const preparing = order.status === 'Preparing' && order.acceptedAt && (now - new Date(order.acceptedAt).getTime()) > PREPARATION_DELAY_MINUTES * 60 * 1000;
        if (order.status === 'Preparing' && order.acceptedAt) {
             elapsed = `Preparing for ${Math.round((now - new Date(order.acceptedAt).getTime()) / 60000)}m`;
        }

        if (order.status === 'On its way' && order.acceptedAt) {
             elapsed = `On its way`;
        }

        return { isUnacceptedDelayed: unaccepted, isPreparationDelayed: preparing, timeElapsed: elapsed };
    }, [order.status, order.placedAt, order.acceptedAt]);

    const getBorderClass = () => {
        if (isUnacceptedDelayed) return 'border-yellow-500 bg-yellow-50';
        if (isPreparationDelayed) return 'border-red-500 bg-red-50';
        return 'border-gray-200 bg-white';
    };
    
    const handleCall = (type: 'customer' | 'vendor' | 'rider') => {
        let message = '';
        if (type === 'customer') message = `Calling customer: ${order.customerName}`;
        if (type === 'vendor') message = `Calling vendor: ${order.restaurantName}`;
        if (type === 'rider') message = `Calling rider: ${order.rider?.name || 'N/A'}`;
        alert(message); // Placeholder for actual call functionality
    };

    const ActionButtons = () => {
        switch (order.status) {
            case 'Placed':
                return (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => onUpdate(order.id, 'Cancelled', `[MOD ACTION]: Order cancelled.`)} className="px-3 py-1 text-sm font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200">Cancel</button>
                        <button onClick={() => onUpdate(order.id, 'Preparing', `[MOD ACTION]: Order accepted for vendor.`)} className="px-3 py-1 text-sm font-semibold rounded-md bg-green-500 text-white hover:bg-green-600">Accept</button>
                    </div>
                );
            case 'Preparing':
                return (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => onUpdate(order.id, 'On its way', `[MOD ACTION]: Marked as ready for pickup.`)} className="px-3 py-1 text-sm font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600">Mark Ready</button>
                    </div>
                );
            case 'On its way':
                return (
                     <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm font-semibold rounded-md bg-gray-200 text-gray-700">Re-assign Rider</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className={`p-4 rounded-lg shadow border-l-4 ${getBorderClass()} flex flex-col space-y-3`}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">{order.restaurantName}</p>
                    <p className="text-xs text-gray-500">To: {order.customerName}</p>
                    <p className="font-mono text-sm text-blue-600">{order.id.split('-')[1]}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg">৳{order.total.toFixed(2)}</p>
                    <p className="text-xs font-semibold text-gray-600">{timeElapsed}</p>
                </div>
            </div>
             {(isUnacceptedDelayed || isPreparationDelayed) && (
                <div className="flex items-center text-xs font-semibold text-yellow-800 bg-yellow-100 px-2 py-1 rounded-md">
                    <ClockIcon className="w-4 h-4 mr-1.5"/>
                    {isUnacceptedDelayed ? `Unaccepted for over ${UNACCEPTED_DELAY_MINUTES} mins` : `In prep for over ${PREPARATION_DELAY_MINUTES} mins`}
                </div>
             )}

            {/* Items */}
            <details className="text-xs">
                <summary className="cursor-pointer font-semibold text-gray-600">{order.items.length} items</summary>
                <ul className="mt-1 pl-2 space-y-0.5 text-gray-500 max-h-24 overflow-y-auto">
                    {order.items.map(item => <li key={item.cartItemId}>{item.quantity} x {item.baseItem.name}</li>)}
                </ul>
            </details>
            
            {/* Moderator Note */}
            {order.moderatorNote && (
                <div className="p-2 bg-gray-100 rounded-md text-xs italic text-gray-600">
                    <strong>Mod Note:</strong> {order.moderatorNote}
                </div>
            )}
            
            {/* Actions */}
            <div className="pt-3 border-t space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500">CONTACT</p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => handleCall('customer')} title="Call Customer" className="p-1.5 rounded-full hover:bg-gray-200"><PhoneIcon className="w-4 h-4 text-gray-600"/></button>
                        <button onClick={() => handleCall('vendor')} title="Call Vendor" className="p-1.5 rounded-full hover:bg-gray-200"><PhoneIcon className="w-4 h-4 text-gray-600"/></button>
                        <button onClick={() => handleCall('rider')} disabled={!order.rider} title="Call Rider" className="p-1.5 rounded-full hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"><PhoneIcon className="w-4 h-4 text-gray-600"/></button>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <button onClick={() => onAddNote(order)} className="flex items-center space-x-1 text-xs text-gray-600 font-medium hover:text-blue-600 transition">
                        <ChatBubbleIcon className="w-4 h-4"/>
                        <span>{order.moderatorNote ? 'Edit Note' : 'Add Note'}</span>
                    </button>
                    <ActionButtons />
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
