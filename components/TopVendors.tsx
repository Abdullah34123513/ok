
import React from 'react';
import type { Restaurant } from '../types';
import { StarIcon } from './Icons';

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick: () => void;
}

const RestaurantMiniCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => (
    <div onClick={onClick} className="flex-shrink-0 w-48 text-center p-2 group cursor-pointer">
        <div className="relative">
            <img src={restaurant.logoUrl} alt={restaurant.name} className="w-24 h-24 mx-auto rounded-full object-cover shadow-md group-hover:shadow-xl transition-shadow duration-300" />
            <div className="absolute bottom-0 right-8 bg-white/90 px-2 py-0.5 rounded-full text-xs font-bold flex items-center shadow">
                <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                <span>{restaurant.rating}</span>
            </div>
        </div>
        <h3 className="mt-2 font-semibold text-gray-800 truncate">{restaurant.name}</h3>
        <p className="text-sm text-gray-500 truncate">{restaurant.cuisine}</p>
    </div>
);

interface TopRestaurantsProps {
    restaurants: Restaurant[];
    onRestaurantClick: (id: string) => void;
    onViewAllClick: () => void;
}

const TopRestaurants: React.FC<TopRestaurantsProps> = ({ restaurants, onRestaurantClick, onViewAllClick }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Top Restaurants</h2>
        <button onClick={onViewAllClick} className="text-red-500 font-semibold hover:text-red-700 transition">
            View All &rarr;
        </button>
      </div>
      <div className="flex overflow-x-auto pb-4 -mx-2">
        {restaurants.length > 0
          ? restaurants.map((restaurant) => <RestaurantMiniCard key={restaurant.id} restaurant={restaurant} onClick={() => onRestaurantClick(restaurant.id)} />)
          : Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 p-2">
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 animate-pulse"></div>
                <div className="h-4 mt-2 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
                <div className="h-3 mt-1 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
              </div>
          ))
        }
      </div>
    </div>
  );
};

export default TopRestaurants;
