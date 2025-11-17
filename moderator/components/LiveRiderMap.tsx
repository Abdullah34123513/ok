import React, { useState, useEffect } from 'react';
import type { LocationPoint } from '@shared/types';
import * as api from '@shared/api';
import { MotorcycleIcon } from './Icons';

interface RiderOnMap {
    id: string;
    name: string;
    location: LocationPoint;
}

const MAP_BOUNDS = {
  minLat: 34.04,
  maxLat: 34.07,
  minLng: -118.26,
  maxLng: -118.23,
};

const getPositionStyle = (location?: LocationPoint | null): React.CSSProperties => {
    if (!location) return { display: 'none' };
    const latPercent = ((location.lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
    const lngPercent = ((location.lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
    return {
      top: `${100 - latPercent}%`,
      left: `${lngPercent}%`,
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      transition: 'top 2s linear, left 2s linear',
    };
};

const LiveRiderMap: React.FC = () => {
    const [riders, setRiders] = useState<RiderOnMap[]>([]);

    useEffect(() => {
        const fetchRiders = async () => {
            const activeRiders = await api.getActiveRidersForMap();
            setRiders(activeRiders);
        };
        fetchRiders();
        
        // Simulate rider movement
        const interval = setInterval(() => {
            setRiders(prevRiders => prevRiders.map(rider => ({
                ...rider,
                location: {
                    lat: rider.location.lat + (Math.random() - 0.5) * 0.0005,
                    lng: rider.location.lng + (Math.random() - 0.5) * 0.0005,
                }
            })));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden relative shadow-inner min-h-[400px]">
            <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `
                linear-gradient(rgba(100,100,100,.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100,100,100,.1) 1px, transparent 1px)
            `, backgroundSize: '20px 20px' }}></div>
            
            {riders.map(rider => (
                <div key={rider.id} style={getPositionStyle(rider.location)} className="z-10 text-[#FF6B00] group">
                    <MotorcycleIcon className="w-8 h-8 drop-shadow-lg" />
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {rider.name}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default LiveRiderMap;