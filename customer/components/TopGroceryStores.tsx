
import React from 'react';
import type { Restaurant } from '@shared/types';
import { StarIcon } from '@components/Icons';

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick: () => void;
}

const GroceryMiniCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => (
    <div onClick={onClick} className="flex-shrink-0 w-48 text-center p-2 group cursor-pointer">
        <div className="relative">
            <img src={restaurant.logoUrl} alt={restaurant.name} className="w-24 h-24 mx-auto rounded-lg object-cover shadow-md group-hover:shadow-xl transition-shadow duration-300 border border-green-100" />
            <div className="absolute bottom-0 right-8 bg-white/90 px-2 py-0.5 rounded-full text-xs font-bold flex items-center shadow">
                <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                <span>{restaurant.rating}</span>
            </div>
        </div>
        <h3 className="mt-2 font-semibold text-gray-800 truncate">{restaurant.name}</h3>
        <p className="text-sm text-green-600 truncate font-medium">{restaurant.deliveryTime}</p>
    </div>
);

interface TopGroceryStoresProps {
    stores: Restaurant[];
    onStoreClick: (id: string) => void;
}

const TopGroceryStores: React.FC<TopGroceryStoresProps> = ({ stores, onStoreClick }) => {
  if (!stores || stores.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-6 bg-green-50 rounded-xl my-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-green-800">Top Grocery Stores</h2>
      </div>
      <div className="flex overflow-x-auto pb-4 -mx-2 scrollbar-hide">
        {stores.map((store) => (
            <GroceryMiniCard key={store.id} restaurant={store} onClick={() => onStoreClick(store.id)} />
        ))}
      </div>
    </div>
  );
};

export default TopGroceryStores;
