import React, { useState, useEffect, useCallback } from 'react';
import type { Offer, Restaurant, Food, SearchResult } from '../types';
import * as api from '../services/api';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import TopRestaurants from '../components/TopVendors';
import OffersCarousel from '../components/OffersCarousel';
import FoodFeed from '../components/FoodFeed';
import FoodCard from '../components/FoodCard';
import { SearchIcon, StarIcon } from '../components/Icons';
import OngoingOrderTracker from '../components/OngoingOrderTracker';

interface HomePageProps {
    location: string;
}

const HomePage: React.FC<HomePageProps> = ({ location }) => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
    const [topRestaurants, setTopRestaurants] = useState<Restaurant[]>([]);
    
    const [foods, setFoods] = useState<Food[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    
    const onRestaurantClick = (id: string) => {
        window.location.hash = `#/restaurant/${id}`;
    };
    
    const onFoodClick = (id: string) => {
        window.location.hash = `#/food/${id}`;
    };

    const resetFoodFeed = useCallback(() => {
        setFoods([]);
        setPage(1);
        setHasMore(true);
    }, []);

    useEffect(() => {
        resetFoodFeed();
        setTopRestaurants([]);
        setOffers([]);
        setActiveOffers([]);
        api.getOffers(location).then(setOffers);
        api.getActiveOffers(location).then(setActiveOffers);
        api.getTopRestaurants(location).then(setTopRestaurants);
    }, [location, resetFoodFeed]);

    const loadMoreFoods = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        api.getFoods(location, page)
            .then(data => {
                setFoods(prev => [...prev, ...data.foods]);
                setPage(data.nextPage);
                setHasMore(data.hasMore);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [location, page, isLoading, hasMore]);
    
    useEffect(() => {
        if (page === 1 && foods.length === 0) { // initial load
            loadMoreFoods();
        }
    }, [location, page, foods.length, loadMoreFoods]); 
    
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults(null);
            return;
        }

        setIsSearching(true);
        const handler = setTimeout(() => {
            api.search(searchQuery, location).then(results => {
                setSearchResults(results);
                setIsSearching(false);
            });
        }, 500); // Debounce search

        return () => clearTimeout(handler);
    }, [searchQuery, location]);

    const renderSearchResults = () => (
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Search results for "{searchQuery}"
            </h2>
            {isSearching ? (
                 <div className="text-center py-10">
                    <SearchIcon className="w-8 h-8 text-gray-400 mx-auto animate-pulse" />
                    <p className="text-gray-500 mt-2">Searching...</p>
                </div>
            ) : searchResults && (searchResults.foods.length > 0 || searchResults.restaurants.length > 0) ? (
                <div>
                    {searchResults.restaurants.length > 0 && (
                        <>
                            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">Restaurants</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {searchResults.restaurants.map(restaurant => (
                                    <div key={restaurant.id} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg transition" onClick={() => onRestaurantClick(restaurant.id)}>
                                        <img src={restaurant.logoUrl} alt={restaurant.name} className="w-16 h-16 rounded-full object-cover"/>
                                        <div>
                                            <h4 className="font-bold">{restaurant.name}</h4>
                                            <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
                                            <div className="flex items-center text-sm text-gray-600 mt-1">
                                                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                                {restaurant.rating}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {searchResults.foods.length > 0 && (
                        <>
                            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">Food Items</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {searchResults.foods.map(food => <FoodCard key={food.id} food={food} onFoodClick={onFoodClick} />)}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-600">No results found.</p>
                </div>
            )}
        </div>
    );
    
    return (
        <>
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            {searchQuery.trim() !== '' ? renderSearchResults() : (
                <>
                    <OngoingOrderTracker />
                    <HeroBanner offers={offers} />
                    <TopRestaurants 
                        restaurants={topRestaurants} 
                        onRestaurantClick={onRestaurantClick} 
                    />
                    <OffersCarousel offers={activeOffers} />
                    <FoodFeed 
                        foods={foods} 
                        onLoadMore={loadMoreFoods} 
                        hasMore={hasMore} 
                        isLoading={isLoading} 
                        onFoodClick={onFoodClick}
                    />
                </>
            )}
        </>
    );
};

export default HomePage;
