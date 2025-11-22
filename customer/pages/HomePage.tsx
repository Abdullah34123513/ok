
import React, { useState, useEffect, useCallback } from 'react';
import type { Offer, Restaurant, Food, SearchResult, Area } from '@shared/types';
import * as api from '@shared/api';
import * as tracking from '@shared/tracking';
import Header from '@components/Header';
import OngoingOrderTracker from '@components/OngoingOrderTracker';
import { SearchIcon, StarIcon, ClockIcon, PackageIcon, HeartIcon, PlusIcon } from '@components/Icons';
import { useCart } from '@contexts/CartContext';

// --- Modern Internal Components for this Page ---

const SectionTitle: React.FC<{ title: string; subtitle?: string; action?: string; onAction?: () => void }> = ({ title, subtitle, action, onAction }) => (
    <div className="flex items-end justify-between px-6 mb-4 mt-8">
        <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>}
        </div>
        {action && (
            <button onClick={onAction} className="text-red-500 text-sm font-bold hover:text-red-600 bg-red-50 px-3 py-1 rounded-full transition-colors">
                {action}
            </button>
        )}
    </div>
);

const CategoryPill: React.FC<{ label: string; icon?: string; isSelected?: boolean; onClick?: () => void }> = ({ label, icon, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center space-y-2 min-w-[80px] transition-transform transform active:scale-95`}
    >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-all ${isSelected ? 'bg-red-500 border-red-500 text-white shadow-red-200' : 'bg-white border-gray-100 text-gray-600'}`}>
            {icon || '🍔'}
        </div>
        <span className={`text-xs font-bold ${isSelected ? 'text-red-600' : 'text-gray-500'}`}>{label}</span>
    </button>
);

const SpotlightCard: React.FC<{ offer: Offer; onClick: () => void }> = ({ offer, onClick }) => (
    <div onClick={onClick} className="relative w-full md:w-96 flex-shrink-0 h-56 rounded-3xl overflow-hidden shadow-lg cursor-pointer group mx-2 first:ml-6 last:mr-6">
        <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                Limited Offer
            </span>
            <h3 className="text-2xl font-bold leading-tight mb-1">{offer.title}</h3>
            <p className="text-sm text-gray-200 line-clamp-1">{offer.description}</p>
        </div>
    </div>
);

const ModernRestaurantCard: React.FC<{ restaurant: Restaurant; onClick: () => void }> = ({ restaurant, onClick }) => (
    <div onClick={onClick} className="w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all mx-2 first:ml-6 last:mr-6 group">
        <div className="relative h-40">
            <img src={restaurant.coverImageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                <StarIcon className="w-3 h-3 text-orange-400 mr-1" />
                {restaurant.rating}
            </div>
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm flex items-center">
                <ClockIcon className="w-3 h-3 mr-1" /> {restaurant.deliveryTime}
            </div>
        </div>
        <div className="p-4">
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-red-500 transition-colors truncate">{restaurant.name}</h3>
            <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500 truncate">{restaurant.cuisine}</p>
                <p className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">৳{restaurant.deliveryFee} fee</p>
            </div>
        </div>
    </div>
);

const EssentialsCard: React.FC<{ store: Restaurant; onClick: () => void; type: 'GROCERY' | 'WAREHOUSE' }> = ({ store, onClick, type }) => (
    <div onClick={onClick} className={`w-40 flex-shrink-0 rounded-2xl p-4 cursor-pointer transition-transform hover:scale-105 border mx-2 first:ml-6 last:mr-6 flex flex-col items-center text-center ${type === 'GROCERY' ? 'bg-green-50 border-green-100' : 'bg-purple-50 border-purple-100'}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm ${type === 'GROCERY' ? 'bg-white text-green-500' : 'bg-white text-purple-500'}`}>
            {type === 'GROCERY' ? <span className="text-2xl">🥦</span> : <PackageIcon className="w-8 h-8" />}
        </div>
        <h4 className={`font-bold text-sm leading-tight ${type === 'GROCERY' ? 'text-green-800' : 'text-purple-800'}`}>{store.name}</h4>
        <p className="text-xs text-gray-500 mt-1">{store.deliveryTime}</p>
    </div>
);

const ModernFoodCard: React.FC<{ food: Food; onClick: () => void }> = ({ food, onClick }) => {
    const { addItem } = useCart();
    
    return (
        <div onClick={onClick} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group relative">
            <div className="aspect-square relative overflow-hidden">
                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        // Quick Add Mock
                        const menuItem = {
                            id: food.id, name: food.name, description: food.description, price: food.price,
                            imageUrl: food.imageUrl, restaurantId: food.restaurantId, restaurantName: food.vendor.name, availability: food.availability
                        };
                        addItem(menuItem, 1, [], food.price);
                    }}
                    className="absolute bottom-2 right-2 bg-white text-red-500 p-2 rounded-full shadow-lg transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300 hover:bg-red-500 hover:text-white"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{food.name}</h4>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-1">
                        ★{food.rating}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">{food.vendor.name}</p>
                <p className="font-extrabold text-gray-900">৳{food.price.toFixed(2)}</p>
            </div>
        </div>
    );
};

// --- Main Page Component ---

interface HomePageProps {
    area: Area;
}

const HomePage: React.FC<HomePageProps> = ({ area }) => {
    // State
    const [offers, setOffers] = useState<Offer[]>([]);
    const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
    const [topRestaurants, setTopRestaurants] = useState<Restaurant[]>([]);
    const [groceryStores, setGroceryStores] = useState<Restaurant[]>([]);
    const [warehouseProducts, setWarehouseProducts] = useState<Food[]>([]);
    const [foods, setFoods] = useState<Food[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Navigation Handlers
    const onRestaurantClick = (id: string) => { window.location.hash = `#/restaurant/${id}`; };
    const onFoodClick = (id: string) => { window.location.hash = `#/food/${id}`; };
    const onOfferClick = (id: string) => { window.location.hash = `#/offer/${id}`; };

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [allOffers, active, topRest, groceries, warehouse] = await Promise.all([
                    api.getOffers(area.id),
                    api.getActiveOffers(area.id),
                    api.getTopRestaurants(area.id),
                    api.getTopGroceryStores(area.id),
                    api.getWarehouseProducts(area.id)
                ]);
                setOffers(allOffers);
                setActiveOffers(active);
                setTopRestaurants(topRest);
                setGroceryStores(groceries);
                setWarehouseProducts(warehouse);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [area.id]);

    // Pagination for Main Feed
    const loadMoreFoods = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        api.getFoods(area.id, page, 8) // Load 8 at a time for grid
            .then(data => {
                setFoods(prev => [...prev, ...data.foods]);
                setPage(data.nextPage);
                setHasMore(data.hasMore);
            })
            .finally(() => setIsLoading(false));
    }, [area.id, page, isLoading, hasMore]);

    useEffect(() => {
        if (page === 1 && foods.length === 0) loadMoreFoods();
    }, [area.id, loadMoreFoods, page, foods.length]);

    // Search Logic
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults(null);
            return;
        }
        setIsSearching(true);
        const handler = setTimeout(() => {
            api.search(searchQuery, area.id).then((results: SearchResult) => {
                setSearchResults(results);
                setIsSearching(false);
                tracking.trackEvent('search', { query: searchQuery });
            });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, area.id]);

    // Render Search Results View
    if (searchQuery.trim() !== '') {
        return (
            <>
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                <div className="bg-gray-50 min-h-screen p-6">
                    {isSearching ? (
                        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div></div>
                    ) : searchResults ? (
                        <div className="space-y-8">
                            {searchResults.restaurants.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Restaurants</h3>
                                    <div className="flex overflow-x-auto space-x-4 pb-4">
                                        {searchResults.restaurants.map(r => <ModernRestaurantCard key={r.id} restaurant={r} onClick={() => onRestaurantClick(r.id)} />)}
                                    </div>
                                </div>
                            )}
                            {searchResults.foods.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Dishes</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {searchResults.foods.map(f => <ModernFoodCard key={f.id} food={f} onClick={() => onFoodClick(f.id)} />)}
                                    </div>
                                </div>
                            )}
                            {searchResults.restaurants.length === 0 && searchResults.foods.length === 0 && (
                                <div className="text-center text-gray-500 mt-20">No results found for "{searchQuery}".</div>
                            )}
                        </div>
                    ) : null}
                </div>
            </>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            
            <OngoingOrderTracker />

            {/* 1. Welcome & Categories */}
            <div className="pt-4">
                <div className="px-6 mb-6">
                    <h1 className="text-xl text-gray-600">Good Morning, <span className="font-bold text-gray-900 block text-3xl">Alex! 👋</span></h1>
                </div>
                
                <div className="flex overflow-x-auto px-6 space-x-4 pb-4 scrollbar-hide mb-4">
                    <CategoryPill label="All" icon="🍽️" isSelected />
                    <CategoryPill label="Burger" icon="🍔" />
                    <CategoryPill label="Pizza" icon="🍕" />
                    <CategoryPill label="Sushi" icon="🍣" />
                    <CategoryPill label="Healthy" icon="🥗" />
                    <CategoryPill label="Dessert" icon="🍩" />
                </div>
            </div>

            {/* 2. Spotlight (Hero) */}
            {offers.length > 0 && (
                <div className="mb-8">
                    <SectionTitle title="Spotlight" />
                    <div className="flex overflow-x-auto pb-6 scrollbar-hide">
                        {offers.slice(0, 3).map(offer => (
                            <SpotlightCard key={offer.id} offer={offer} onClick={() => onOfferClick(offer.id)} />
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Essentials (Grocery & Warehouse) */}
            {(groceryStores.length > 0 || warehouseProducts.length > 0) && (
                <div className="mb-8">
                    <SectionTitle title="Pantry & Essentials" subtitle="Get your groceries delivered fast" />
                    <div className="flex overflow-x-auto pb-4 scrollbar-hide">
                        {groceryStores.map(store => (
                            <EssentialsCard key={store.id} store={store} type="GROCERY" onClick={() => onRestaurantClick(store.id)} />
                        ))}
                        {warehouseProducts.length > 0 && (
                            <div className="ml-2 pl-4 border-l border-gray-200 flex space-x-4">
                                <div className="flex flex-col justify-center px-2">
                                    <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Warehouse<br/>Deals</span>
                                </div>
                                {warehouseProducts.slice(0, 3).map(prod => (
                                    <div key={prod.id} onClick={() => onFoodClick(prod.id)} className="w-32 flex-shrink-0 bg-white rounded-xl p-2 shadow-sm border border-purple-50 cursor-pointer">
                                        <img src={prod.imageUrl} className="w-full h-20 object-cover rounded-lg mb-2" />
                                        <p className="text-xs font-bold text-gray-800 truncate">{prod.name}</p>
                                        <p className="text-xs text-purple-600 font-bold">৳{prod.price}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. Trending Restaurants */}
            <div className="mb-8">
                <SectionTitle title="Trending Spots" action="View All" onAction={() => window.location.hash = '#/restaurants'} />
                <div className="flex overflow-x-auto pb-6 scrollbar-hide">
                    {topRestaurants.map(rest => (
                        <ModernRestaurantCard key={rest.id} restaurant={rest} onClick={() => onRestaurantClick(rest.id)} />
                    ))}
                </div>
            </div>

            {/* 5. Main Feed (Recommended) */}
            <div className="px-6">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Recommended For You</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {foods.map(food => (
                        <ModernFoodCard key={food.id} food={food} onClick={() => onFoodClick(food.id)} />
                    ))}
                </div>
                
                {hasMore && (
                    <div className="mt-8 text-center">
                        <button 
                            onClick={loadMoreFoods} 
                            disabled={isLoading}
                            className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-full shadow-sm hover:bg-gray-50 hover:text-red-500 transition-all"
                        >
                            {isLoading ? 'Loading flavors...' : 'Load More'}
                        </button>
                    </div>
                )}
                
                {!hasMore && (
                    <div className="mt-12 text-center text-gray-400 text-sm pb-10">
                        <p>You've reached the end of the foodie universe! 🌮</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
