
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Offer, Restaurant, Food, SearchResult, Area } from '@shared/types';
import * as api from '@shared/api';
import * as tracking from '@shared/tracking';
import Header from '@components/Header';
import OngoingOrderTracker from '@components/OngoingOrderTracker';
import { SearchIcon, StarIcon, ClockIcon, PackageIcon, HeartIcon, PlusIcon } from '@components/Icons';
import { useCart } from '@contexts/CartContext';

// --- MODERN UI COMPONENTS (Local to Home Page for unique design) ---

const SectionHeader: React.FC<{ title: string; subtitle?: string; onAction?: () => void; actionLabel?: string }> = ({ title, subtitle, onAction, actionLabel }) => (
    <div className="flex items-end justify-between px-6 mb-5 mt-10 first:mt-2">
        <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 font-medium mt-1.5">{subtitle}</p>}
        </div>
        {onAction && (
            <button onClick={onAction} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors uppercase tracking-wide">
                {actionLabel || 'See All'}
            </button>
        )}
    </div>
);

const HeroSlide: React.FC<{ offer: Offer; onClick: () => void }> = ({ offer, onClick }) => (
    <div onClick={onClick} className="relative w-full md:w-[400px] flex-shrink-0 h-64 rounded-[2rem] overflow-hidden shadow-xl shadow-orange-900/10 cursor-pointer group mx-2 first:ml-6 last:mr-6 transform transition-all hover:scale-[1.02]">
        <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white max-w-[85%]">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3">
                Limited Time
            </span>
            <h3 className="text-3xl font-extrabold leading-tight mb-2 drop-shadow-sm">{offer.title}</h3>
            <p className="text-sm text-gray-200 line-clamp-2 opacity-90">{offer.description}</p>
        </div>
    </div>
);

const CategoryCircle: React.FC<{ label: string; icon: string; isSelected?: boolean; onClick?: () => void }> = ({ label, icon, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center space-y-3 min-w-[80px] group"
    >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 transition-all duration-300 group-hover:shadow-md ${isSelected ? 'bg-red-500 border-red-500 text-white shadow-red-200 scale-110' : 'bg-white border-gray-100 text-gray-700 group-hover:border-red-100'}`}>
            {icon}
        </div>
        <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-800'}`}>{label}</span>
    </button>
);

const GroceryTile: React.FC<{ store: Restaurant; onClick: () => void }> = ({ store, onClick }) => (
    <div onClick={onClick} className="w-36 flex-shrink-0 rounded-2xl p-4 bg-white border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer mx-2 first:ml-6 last:mr-6 flex flex-col items-center text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="text-2xl">🥦</span>
        </div>
        <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1">{store.name}</h4>
        <p className="text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-wide">{store.deliveryTime}</p>
    </div>
);

const WarehouseTile: React.FC<{ product: Food; onClick: () => void }> = ({ product, onClick }) => (
    <div onClick={onClick} className="w-36 flex-shrink-0 rounded-2xl p-3 bg-purple-50 border border-purple-100 shadow-sm hover:shadow-md transition-all cursor-pointer mx-2 first:ml-6 last:mr-6 flex flex-col group">
        <div className="relative w-full h-24 mb-3 rounded-xl overflow-hidden">
            <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute top-1 left-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">BULK</div>
        </div>
        <h4 className="font-bold text-gray-800 text-xs leading-tight line-clamp-2 mb-1">{product.name}</h4>
        <p className="text-sm text-purple-700 font-black mt-auto">৳{product.price}</p>
    </div>
);

const TrendingRestaurantCard: React.FC<{ restaurant: Restaurant; onClick: () => void }> = ({ restaurant, onClick }) => (
    <div onClick={onClick} className="w-80 flex-shrink-0 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all mx-3 first:ml-6 last:mr-6 group relative">
        <div className="h-48 overflow-hidden relative">
            <img src={restaurant.coverImageUrl} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                <StarIcon className="w-3.5 h-3.5 text-yellow-400 mr-1" />
                {restaurant.rating}
            </div>
        </div>
        <div className="p-5">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-gray-900 leading-tight group-hover:text-red-600 transition-colors">{restaurant.name}</h3>
                {restaurant.isFavorite && <HeartIcon isFilled={true} className="w-5 h-5 text-red-500 flex-shrink-0" />}
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-4">
                <span className="font-medium">{restaurant.cuisine}</span>
                <span className="mx-2 text-gray-300">•</span>
                <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600">৳{restaurant.deliveryFee} Delivery</span>
            </div>
        </div>
    </div>
);

const MasonryFoodCard: React.FC<{ food: Food; onClick: () => void }> = ({ food, onClick }) => {
    const { addItem } = useCart();
    
    return (
        <div onClick={onClick} className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative break-inside-avoid mb-4">
            <div className="aspect-square rounded-2xl overflow-hidden relative mb-3">
                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                
                {/* Quick Add Button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        const menuItem = {
                            id: food.id, name: food.name, description: food.description, price: food.price,
                            imageUrl: food.imageUrl, restaurantId: food.restaurantId, restaurantName: food.vendor.name, availability: food.availability
                        };
                        addItem(menuItem, 1, [], food.price);
                    }}
                    className="absolute bottom-2 right-2 bg-white text-gray-900 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transform translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white z-10"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div className="px-1">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">{food.name}</h4>
                    <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-700 flex-shrink-0">
                        ★ {food.rating}
                    </div>
                </div>
                <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-1">{food.vendor.name}</p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-gray-900">৳{food.price}</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

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

    // Navigation
    const onRestaurantClick = (id: string) => { window.location.hash = `#/restaurant/${id}`; };
    const onFoodClick = (id: string) => { window.location.hash = `#/food/${id}`; };
    const onOfferClick = (id: string) => { window.location.hash = `#/offer/${id}`; };

    // Fetch Data
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

    // Infinite Scroll for Foods
    const loadMoreFoods = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        api.getFoods(area.id, page, 8)
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

    // --- RENDER SEARCH VIEW ---
    if (searchQuery.trim() !== '') {
        return (
            <div className="bg-white min-h-screen pb-20">
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                <div className="p-6">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mb-4"></div>
                            <p>Searching flavors...</p>
                        </div>
                    ) : searchResults ? (
                        <div className="space-y-10">
                            {searchResults.restaurants.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurants</h3>
                                    <div className="flex overflow-x-auto space-x-4 pb-4 -mx-6 px-6">
                                        {searchResults.restaurants.map(r => <TrendingRestaurantCard key={r.id} restaurant={r} onClick={() => onRestaurantClick(r.id)} />)}
                                    </div>
                                </div>
                            )}
                            {searchResults.foods.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Dishes</h3>
                                    <div className="columns-2 gap-4">
                                        {searchResults.foods.map(f => <MasonryFoodCard key={f.id} food={f} onClick={() => onFoodClick(f.id)} />)}
                                    </div>
                                </div>
                            )}
                            {searchResults.restaurants.length === 0 && searchResults.foods.length === 0 && (
                                <div className="text-center text-gray-500 mt-20">
                                    <p className="text-lg">No results found for "{searchQuery}"</p>
                                    <p className="text-sm">Try searching for 'Pizza', 'Burger', or 'Sushi'</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    // --- RENDER MAIN HOME VIEW ---
    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-32 font-sans selection:bg-red-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Delivering to</p>
                            <div className="flex items-center text-red-600 font-bold text-sm cursor-pointer hover:underline">
                                <span className="truncate max-w-[200px]">{area.name}</span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <a href="#/profile"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Alex`} alt="Profile" /></a>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="What are you craving?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-100 border-none rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all shadow-inner"
                        />
                    </div>
                </div>
            </div>

            <OngoingOrderTracker />

            {/* Categories */}
            <div className="pt-6">
                <div className="flex overflow-x-auto px-6 space-x-4 pb-2 scrollbar-hide snap-x">
                    <CategoryCircle label="Offers" icon="🔥" onClick={() => window.location.hash = '#/offers'} />
                    <CategoryCircle label="Burger" icon="🍔" onClick={() => setSearchQuery('Burger')} />
                    <CategoryCircle label="Pizza" icon="🍕" onClick={() => setSearchQuery('Pizza')} />
                    <CategoryCircle label="Asian" icon="🍜" onClick={() => setSearchQuery('Asian')} />
                    <CategoryCircle label="Healthy" icon="🥗" onClick={() => setSearchQuery('Healthy')} />
                    <CategoryCircle label="Dessert" icon="🍩" onClick={() => setSearchQuery('Dessert')} />
                    <CategoryCircle label="Drinks" icon="🥤" onClick={() => setSearchQuery('Drinks')} />
                </div>
            </div>

            {/* Hero Banner (Spotlight) */}
            {activeOffers.length > 0 && (
                <div className="mt-8">
                    <div className="flex overflow-x-auto pb-8 px-4 -mx-2 scrollbar-hide snap-x snap-mandatory">
                        {activeOffers.slice(0, 3).map(offer => (
                            <div key={offer.id} className="snap-center">
                                <HeroSlide offer={offer} onClick={() => onOfferClick(offer.id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Essentials Row (Grocery + Warehouse) */}
            {(groceryStores.length > 0 || warehouseProducts.length > 0) && (
                <div className="mb-8">
                    <SectionHeader title="Daily Essentials" subtitle="Groceries & Warehouse Deals delivered fast" />
                    <div className="flex overflow-x-auto pb-6 px-4 -mx-2 scrollbar-hide">
                        {groceryStores.map(store => (
                            <GroceryTile key={store.id} store={store} onClick={() => onRestaurantClick(store.id)} />
                        ))}
                        
                        {warehouseProducts.length > 0 && (
                            <div className="flex pl-4 ml-2 border-l border-gray-200 relative">
                                <div className="absolute -top-4 left-6 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-b-md z-10">
                                    WAREHOUSE
                                </div>
                                {warehouseProducts.slice(0, 4).map(prod => (
                                    <WarehouseTile key={prod.id} product={prod} onClick={() => onFoodClick(prod.id)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Trending Restaurants */}
            <div className="mb-4">
                <SectionHeader title="Curated Collections" subtitle="Top rated spots in your area" actionLabel="View All" onAction={() => window.location.hash = '#/restaurants'} />
                <div className="flex overflow-x-auto pb-10 px-4 -mx-2 scrollbar-hide snap-x">
                    {topRestaurants.map(rest => (
                        <div key={rest.id} className="snap-center">
                            <TrendingRestaurantCard restaurant={rest} onClick={() => onRestaurantClick(rest.id)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommended Feed (Masonry) */}
            <div className="px-4">
                <div className="flex items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900">Recommended For You</h2>
                    <div className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">
                        Based on your likes
                    </div>
                </div>
                
                {/* CSS Columns for Masonry effect */}
                <div className="columns-2 gap-4 space-y-4">
                    {foods.map(food => (
                        <MasonryFoodCard key={food.id} food={food} onClick={() => onFoodClick(food.id)} />
                    ))}
                </div>

                {hasMore && (
                    <div className="mt-12 mb-8 text-center">
                        <button 
                            onClick={loadMoreFoods} 
                            disabled={isLoading}
                            className="px-8 py-4 bg-white text-gray-900 font-bold rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center"><div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div> Loading...</span>
                            ) : 'Discover More'}
                        </button>
                    </div>
                )}
                
                {!hasMore && (
                    <div className="py-10 text-center">
                        <p className="text-gray-400 text-sm font-medium">You've reached the end of the list!</p>
                        <div className="w-16 h-1 bg-gray-200 mx-auto mt-4 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
