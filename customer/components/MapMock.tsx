import React from 'react';
import type { LocationPoint } from '@shared/types';
import { HomeIcon, MotorcycleIcon, RestaurantIcon } from '@components/Icons';

interface MapMockProps {
  restaurantLocation?: LocationPoint;
  deliveryLocation?: LocationPoint;
  riderLocation?: LocationPoint;
}

// Define the bounding box of our mock city to map lat/lng to percentages
const MAP_BOUNDS = {
  minLat: 34.04,
  maxLat: 34.07,
  minLng: -118.26,
  maxLng: -118.23,
};

const MapMock: React.FC<MapMockProps> = ({ restaurantLocation, deliveryLocation, riderLocation }) => {
    
  const getPositionStyle = (location?: LocationPoint): React.CSSProperties => {
    if (!location) return { display: 'none' };

    const latPercent = ((location.lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
    const lngPercent = ((location.lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;

    return {
      top: `${100 - latPercent}%`, // Invert latitude for top-down view
      left: `${lngPercent}%`,
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden relative shadow-inner">
      {/* Mock map background pattern */}
      <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `
        linear-gradient(rgba(100,100,100,.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(100,100,100,.1) 1px, transparent 1px)
      `, backgroundSize: '20px 20px' }}></div>
      
      {/* Dashed line from restaurant to home */}
      {restaurantLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full" style={{pointerEvents: 'none'}}>
            <line 
                x1={`${getPositionStyle(restaurantLocation).left}`} 
                y1={`${getPositionStyle(restaurantLocation).top}`}
                x2={`${getPositionStyle(deliveryLocation).left}`}
                y2={`${getPositionStyle(deliveryLocation).top}`}
                stroke="#60a5fa" 
                strokeWidth="3"
                strokeDasharray="8 8"
            />
          </svg>
      )}

      {/* Restaurant Marker */}
      <div style={getPositionStyle(restaurantLocation)} className="z-10 text-red-500">
        <RestaurantIcon className="w-8 h-8 drop-shadow-lg" />
      </div>

      {/* Delivery Address Marker */}
      <div style={getPositionStyle(deliveryLocation)} className="z-10 text-green-500">
        <HomeIcon className="w-8 h-8 drop-shadow-lg" />
      </div>

      {/* Rider Marker */}
      <div style={{ ...getPositionStyle(riderLocation), transition: 'top 2s linear, left 2s linear' }} className="z-20 text-blue-500">
        <MotorcycleIcon className="w-8 h-8 drop-shadow-lg" />
      </div>

    </div>
  );
};

export default MapMock;
