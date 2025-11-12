import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Restaurant } from '@shared/types';
import * as api from '@shared/api';
import RestaurantCard from '@components/RestaurantCard';
import { FilterIcon } from '@components/Icons';

interface RestaurantListPageProps {
    location: string;
}

const RestaurantCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
        <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-full w-1/3 animate-pulse"></div>
            </div>
        </div>
    </div>
);


const RestaurantListPage: React.FC<RestaurantListPageProps> = ({ location }) => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    const onRestaurantClick = (id: string) => {
        window.location.hash = `#/restaurant/${id}`;
    };
    
    const loadMoreRestaurants = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        api.getRestaurants(location, page)
            .then(data => {
                setRestaurants(prev => [...prev, ...data.restaurants]);
                setPage(data.nextPage);
                setHasMore(data.hasMore);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [location, page, isLoading, hasMore]);
    
    useEffect(() => {
        // Initial load
        setRestaurants([]);
        setPage(1);
        setHasMore(true);
        // We need to wrap in a timeout to allow state to clear before loading
        setTimeout(() => loadMoreRestaurants(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastRestaurantElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreRestaurants();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, loadMoreRestaurants]);


    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">All Restaurants</h2>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-full shadow-sm hover:bg-gray-50"
                >
                    <FilterIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">Filters</span>
                </button>
            </div>

            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow mb-6 animate-fade-in-up">
                    <h3 className="font-semibold mb-2">Filter by:</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                        {/* Placeholder filter options */}
                        <button className="px-3 py-1 border rounded-full hover:bg-red-500 hover:text-white transition">Cuisine</button>
                        <button className="px-3 py-1 border rounded-full hover:bg-red-500 hover:text-white transition">Rating 4.0+</button>
                        <button className="px-3 py-1 border rounded-full hover:bg-red-500 hover:text-white transition">Price</button>
                        <button className="px-3 py-1 border rounded-full hover:bg-red-500 hover:text-white transition">Delivery Time</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant, index) => {
                    const isLastElement = restaurants.length === index + 1;
                    return (
                        <div ref={isLastElement ? lastRestaurantElementRef : null} key={restaurant.id}>
                            <RestaurantCard restaurant={restaurant} onClick={() => onRestaurantClick(restaurant.id)} />
                        </div>
                    );
                })}
                {isLoading && Array.from({ length: 8 }).map((_, i) => <RestaurantCardSkeleton key={`skeleton-${i}`} />)}
            </div>

            {!hasMore && !isLoading && restaurants.length > 0 && (
                <p className="text-center text-gray-500 mt-8">You've seen all restaurants!</p>
            )}
        </div>
    );
};

export default RestaurantListPage;