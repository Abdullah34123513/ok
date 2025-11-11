import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import type { Order } from '../types';
import { MotorcycleIcon, CloseIcon } from './Icons';

const OngoingOrderTracker: React.FC = () => {
    const [ongoingOrder, setOngoingOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        api.getOrders('ongoing')
            .then(orders => {
                if (orders.length > 0) {
                    const latestOrder = orders[0];
                    const dismissed = sessionStorage.getItem(`dismissed_order_${latestOrder.id}`);
                    if (!dismissed) {
                        setOngoingOrder(latestOrder);
                        setIsVisible(true);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (ongoingOrder) {
            sessionStorage.setItem(`dismissed_order_${ongoingOrder.id}`, 'true');
        }
        setIsVisible(false);
    };

    const handleNavigate = () => {
        if (ongoingOrder) {
            window.location.hash = `#/track/${ongoingOrder.id}`;
        }
    };
    
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 pt-4">
                <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    if (!ongoingOrder || !isVisible) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 pt-4">
             <div 
                onClick={handleNavigate}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow animate-fade-in-up"
                role="button"
                tabIndex={0}
                aria-label={`Track your order from ${ongoingOrder.restaurantName}`}
            >
                <div className="flex items-center overflow-hidden">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                        <MotorcycleIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-blue-800 truncate">Your order from {ongoingOrder.restaurantName} is {ongoingOrder.status.toLowerCase()}.</p>
                        <p className="text-sm text-blue-600">Click to see live updates on your delivery.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4 ml-2 flex-shrink-0">
                     <span className="font-bold text-blue-700 hidden sm:block">Track Order &rarr;</span>
                     <button 
                        onClick={handleDismiss} 
                        className="p-2 rounded-full hover:bg-blue-100"
                        aria-label="Dismiss order notification"
                    >
                         <CloseIcon className="w-5 h-5 text-blue-500" />
                     </button>
                </div>
            </div>
        </div>
    );
};

export default OngoingOrderTracker;
