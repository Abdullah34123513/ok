
import React from 'react';
import type { Restaurant } from '../types';
import { StarIcon } from './Icons';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <div onClick={onClick} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
      <div className="relative">
        <img src={restaurant.coverImageUrl.replace('/1200/400', '/600/300')} alt={restaurant.name} className="w-full h-40 object-cover" />
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-bold flex items-center shadow">
          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
          <span>{restaurant.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">{restaurant.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{restaurant.cuisine}</p>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>${restaurant.deliveryFee.toFixed(2)} Fee</span>
          <span>{restaurant.deliveryTime}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
