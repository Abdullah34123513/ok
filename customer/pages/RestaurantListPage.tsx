
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Restaurant, Area } from '@shared/types';
import * as api from '@shared/api';
import RestaurantCard from '@components/RestaurantCard';
import { FilterIcon, StarIcon, ClockIcon, MoneyIcon } from '@components/Icons';

interface RestaurantListPageProps {
    area: Area;
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

const RestaurantListPage: React.FC<RestaurantListPageProps> = ({ area }) => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filter States
    const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'deliveryFee' | undefined>(undefined);
    const [priceRange, setPriceRange] = useState<string | undefined>(undefined);
    const [minRating, setMinRating] = useState<number | undefined>(undefined);

    const onRestaurantClick = (id: string) => {
        window.location.hash = `#/restaurant/${id}`;
    };
    
    const loadRestaurants = useCallback((isReset = false) => {
        if (isLoading || (!hasMore && !isReset)) return;
        setIsLoading(true);
        
        const currentPage = isReset ? 1 : page;
        
        api.getRestaurants(area.id, currentPage, 12, { sortBy, priceRange, minRating })
            .then(data => {
                setRestaurants(prev => isReset ? data.restaurants : [...prev, ...data.restaurants]);
                setPage(data.nextPage);
                setHasMore(data.hasMore);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [area.id, page, isLoading, hasMore, sortBy, priceRange, minRating]);

    // Effect to reload when filters change
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setRestaurants([]);
        // Use timeout to allow state to settle
        const timeoutId = setTimeout(() => loadRestaurants(true), 0);
        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [area, sortBy, priceRange, minRating]); // Trigger reload on filter change

    const observer = useRef<IntersectionObserver | null>(null);
    const lastRestaurantElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadRestaurants();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, loadRestaurants]);

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">All Restaurants</h2>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-full shadow-sm transition ${showFilters ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                >
                    <FilterIcon className="w-5 h-5" />
                    <span className="font-semibold">Filters</span>
                </button>
            </div>

            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow mb-6 animate-fade-in-up border border-gray-100">
                    <div className="space-y-4">
                        {/* Sort By */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Sort By</h3>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setSortBy(sortBy === 'rating' ? undefined : 'rating')} className={`px-3 py-1.5 text-sm rounded-full border flex items-center transition ${sortBy === 'rating' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                    <StarIcon className="w-4 h-4 mr-1" /> Rating
                                </button>
                                <button onClick={() => setSortBy(sortBy === 'deliveryTime' ? undefined : 'deliveryTime')} className={`px-3 py-1.5 text-sm rounded-full border flex items-center transition ${sortBy === 'deliveryTime' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                    <ClockIcon className="w-4 h-4 mr-1" /> Fastest Delivery
                                </button>
                                <button onClick={() => setSortBy(sortBy === 'deliveryFee' ? undefined : 'deliveryFee')} className={`px-3 py-1.5 text-sm rounded-full border flex items-center transition ${sortBy === 'deliveryFee' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                    <MoneyIcon className="w-4 h-4 mr-1" /> Lowest Cost
                                </button>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Price Range</h3>
                             <div className="flex flex-wrap gap-2">
                                {['$', '$$', '$$$'].map(range => (
                                    <button 
                                        key={range}
                                        onClick={() => setPriceRange(priceRange === range ? undefined : range)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition ${priceRange === range ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Min Rating */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Rating</h3>
                            <button 
                                onClick={() => setMinRating(minRating === 4.0 ? undefined : 4.0)}
                                className={`px-3 py-1.5 text-sm rounded-full border flex items-center transition ${minRating === 4.0 ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                <StarIcon className="w-4 h-4 mr-1" /> 4.0+
                            </button>
                        </div>
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
                {isLoading && Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={`skeleton-${i}`} />)}
            </div>

            {!hasMore && !isLoading && restaurants.length > 0 && (
                <p className="text-center text-gray-500 mt-8">You've seen all matching restaurants!</p>
            )}
             {!hasMore && !isLoading && restaurants.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-600 text-lg">No restaurants found matching your filters.</p>
                    <button onClick={() => { setSortBy(undefined); setPriceRange(undefined); setMinRating(undefined); }} className="mt-2 text-red-500 font-semibold hover:underline">Clear Filters</button>
                </div>
            )}
        </div>
    );
};

export default RestaurantListPage;
