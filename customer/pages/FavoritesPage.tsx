
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { Restaurant } from '@shared/types';
import RestaurantCard from '@components/RestaurantCard';
import { HeartIcon } from '@components/Icons';

const FavoritesPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.getFavoriteRestaurants()
            .then(setRestaurants)
            .finally(() => setIsLoading(false));
    }, []);

    const onRestaurantClick = (id: string) => {
        window.location.hash = `#/restaurant/${id}`;
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <HeartIcon isFilled={true} className="w-6 h-6 text-red-500 mr-2" />
                Saved Restaurants
            </h1>

            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                         <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse h-64"></div>
                    ))}
                </div>
            ) : restaurants.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                    <HeartIcon isFilled={false} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700">No saved restaurants yet</h2>
                    <p className="text-gray-500 mt-2 mb-6">Mark restaurants as favorites to easily find them here later.</p>
                    <a href="#/restaurants" className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition">
                        Explore Restaurants
                    </a>
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {restaurants.map(restaurant => (
                         <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={() => onRestaurantClick(restaurant.id)} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
