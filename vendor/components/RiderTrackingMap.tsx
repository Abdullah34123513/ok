

import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { LocationPoint, Order } from '@shared/types';
import { HomeIcon, MotorcycleIcon, StorefrontIcon } from './Icons';

// This will be a simplified MapMock for the vendor dashboard
// It reuses the same logic for positioning elements
const MAP_BOUNDS = {
  minLat: 34.04,
  maxLat: 34.07,
  minLng: -118.26,
  maxLng: -118.23,
};

// FIX: Using a specific return type instead of React.CSSProperties to resolve property access errors.
const getPositionStyle = (location?: LocationPoint | null): { 
  display?: 'none'; 
  top?: string; 
  left?: string; 
  position?: 'absolute'; 
  transform?: string;
} => {
    if (!location) return { display: 'none' };
    const latPercent = ((location.lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
    const lngPercent = ((location.lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
    return {
      top: `${100 - latPercent}%`,
      left: `${lngPercent}%`,
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
    };
};

interface RiderTrackingMapProps {
    order: Order;
}

const RiderTrackingMap: React.FC<RiderTrackingMapProps> = ({ order }) => {
    const [riderLocation, setRiderLocation] = useState<LocationPoint | null>(order.rider?.location || null);
    
    useEffect(() => {
        if (!order.id) return;

        const intervalId = setInterval(() => {
            api.getRiderLocation(order.id).then((location) => {
                if (location) {
                    setRiderLocation(location);
                }
            });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId);
    }, [order.id]);

    return (
        <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden relative shadow-inner my-4">
            <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `linear-gradient(rgba(100,100,100,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,.1) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
            
            {order.restaurantLocation && order.deliveryLocation && (
                <svg className="absolute inset-0 w-full h-full" style={{pointerEvents: 'none'}}>
                    <line x1={`${getPositionStyle(order.restaurantLocation).left}`} y1={`${getPositionStyle(order.restaurantLocation).top}`} x2={`${getPositionStyle(order.deliveryLocation).left}`} y2={`${getPositionStyle(order.deliveryLocation).top}`} stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 5" />
                </svg>
            )}
            
            <div style={getPositionStyle(order.restaurantLocation)} className="z-10 text-blue-500" title={`Restaurant: ${order.restaurantName}`}><StorefrontIcon className="w-7 h-7 drop-shadow-md" /></div>
            <div style={getPositionStyle(order.deliveryLocation)} className="z-10 text-green-500" title={`Customer: ${order.customerName}`}><HomeIcon className="w-7 h-7 drop-shadow-md" /></div>
            <div style={{ ...getPositionStyle(riderLocation), transition: 'top 2s linear, left 2s linear' }} className="z-20 text-red-500" title={`Rider: ${order.rider?.name}`}><MotorcycleIcon className="w-7 h-7 drop-shadow-md" /></div>
        </div>
    );
};

export default RiderTrackingMap;
