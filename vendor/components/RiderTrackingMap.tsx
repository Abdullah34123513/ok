
import React, { useState, useEffect, useRef } from 'react';
import * as api from '@shared/api';
import type { LocationPoint, Order } from '@shared/types';

interface RiderTrackingMapProps {
    order: Order;
}

declare global {
    interface Window {
        google: any;
    }
}

const RiderTrackingMap: React.FC<RiderTrackingMapProps> = ({ order }) => {
    const [riderLocation, setRiderLocation] = useState<LocationPoint | null>(order.rider?.location || null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});

    useEffect(() => {
        if (!mapRef.current || !window.google || !order) return;

        // Initialize Map if not exists
        if (!mapInstance.current) {
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: order.restaurantLocation || { lat: 34.0522, lng: -118.2437 },
                zoom: 14,
                disableDefaultUI: true,
            });
        }

        // Clear existing markers
        Object.values(markersRef.current).forEach((marker: any) => marker.setMap(null));
        markersRef.current = {};

        const bounds = new window.google.maps.LatLngBounds();

        // Restaurant Marker
        if (order.restaurantLocation) {
            const pos = order.restaurantLocation;
            markersRef.current['restaurant'] = new window.google.maps.Marker({
                position: pos,
                map: mapInstance.current,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#3B82F6', // Blue
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: 'white',
                },
                title: `Restaurant: ${order.restaurantName}`
            });
            bounds.extend(pos);
        }

        // Customer Marker
        if (order.deliveryLocation) {
            const pos = order.deliveryLocation;
            markersRef.current['customer'] = new window.google.maps.Marker({
                position: pos,
                map: mapInstance.current,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#10B981', // Green
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: 'white',
                },
                title: `Customer: ${order.customerName}`
            });
            bounds.extend(pos);
        }

        // Rider Marker
        if (riderLocation) {
            const pos = riderLocation;
            markersRef.current['rider'] = new window.google.maps.Marker({
                position: pos,
                map: mapInstance.current,
                icon: {
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 6,
                    fillColor: '#EF4444', // Red
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: 'white',
                    rotation: 0, // Could calculate bearing if we had previous position
                },
                title: `Rider: ${order.rider?.name}`
            });
            bounds.extend(pos);
        }

        if (!bounds.isEmpty()) {
            mapInstance.current.fitBounds(bounds, 50); // 50px padding
        }

    }, [order.id]); // Re-init if order changes completely (though usually we just update rider pos)

    // Poll for Rider Location updates
    useEffect(() => {
        if (!order.id || !mapInstance.current || !markersRef.current['rider']) return;

        const intervalId = setInterval(() => {
            api.getRiderLocation(order.id).then((location) => {
                if (location) {
                    setRiderLocation(location);
                    // Update existing marker position smoothly
                    if (markersRef.current['rider']) {
                        markersRef.current['rider'].setPosition(location);
                    }
                }
            });
        }, 5000);

        return () => clearInterval(intervalId);
    }, [order.id]);

    return (
        <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden relative shadow-inner my-4 border">
             {!window.google && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Loading Map...
                </div>
            )}
            <div ref={mapRef} className="w-full h-full"></div>
        </div>
    );
};

export default RiderTrackingMap;
