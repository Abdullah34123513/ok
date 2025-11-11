import React, { useState, useEffect } from 'react';
import type { Restaurant, MenuCategory, Review, MenuItem, Offer } from '../types';
import * as api from '../services/api';
import * as tracking from '../services/tracking';
import { StarIcon, HeartIcon } from '../components/Icons';
import { useCart } from '../contexts/CartContext';
import QuantityControl from '../components/QuantityControl';

interface RestaurantDetailPageProps {
    restaurantId: string;
}

type Tab = 'menu' | 'reviews' | 'about';

const StickyCartSummary: React.FC = () => {
    const { cartCount, grandTotal } = useCart();
    if (cartCount === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 shadow-lg z-20 animate-fade-in-up">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <p className="font-bold text-lg">{cartCount} {cartCount > 1 ? 'items' : 'item'} in cart</p>
                </div>
                <div className="flex items-center space-x-4">
                    <p className="font-extrabold text-xl">${grandTotal.toFixed(2)}</p>
                    <a href="#/cart" className="bg-white text-red-500 font-bold py-2 px-6 rounded-full hover:bg-red-100 transition">
                        View Cart
                    </a>
                </div>
            </div>
        </div>
    );
};

const RestaurantDetailSkeleton = () => (
    <div className="animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-64 bg-gray-200 relative">
            <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="h-10 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-2/3"></div>
            </div>
        </div>
        
        {/* Tabs Skeleton */}
        <div className="sticky top-[68px] bg-white z-10 shadow-sm">
            <div className="container mx-auto flex space-x-4 p-2">
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
            </div>
        </div>

        {/* Menu Content Skeleton */}
        <div className="container mx-auto p-4 sm:p-6">
            <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow flex space-x-4">
                            <div className="w-24 h-24 rounded-md bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="w-24 flex flex-col items-end justify-between">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-8 bg-gray-200 rounded-full w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


const RestaurantDetailPage: React.FC<RestaurantDetailPageProps> = ({ restaurantId }) => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<MenuCategory[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [restaurantOffers, setRestaurantOffers] = useState<Offer[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('menu');
    const [isLoading, setIsLoading] = useState(true);
    const { applyOffer } = useCart();
    
    const onFoodClick = (id: string) => {
        window.location.hash = `#/food/${id}`;
    };
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [details, menuData, reviewsData, offersData] = await Promise.all([
                    api.getRestaurantDetails(restaurantId),
                    api.getRestaurantMenu(restaurantId),
                    api.getRestaurantReviews(restaurantId),
                    api.getOffersForRestaurant(restaurantId)
                ]);
                setRestaurant(details || null);
                if (details) {
                    tracking.trackEvent('view_restaurant_detail', { 
                        restaurantId: details.id, 
                        restaurantName: details.name,
                        cuisine: details.cuisine,
                        rating: details.rating,
                    });
                }
                setMenu(menuData);
                setReviews(reviewsData);
                setRestaurantOffers(offersData);
            } catch (error) {
                console.error("Failed to fetch restaurant data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [restaurantId]);

    const handleToggleFavorite = async () => {
        if (!restaurant) return;
        
        const newFavoriteStatus = !restaurant.isFavorite;
        setRestaurant(prev => prev ? { ...prev, isFavorite: newFavoriteStatus } : null);

        try {
            if (newFavoriteStatus) {
                await api.addFavoriteRestaurant(restaurant.id);
            } else {
                await api.removeFavoriteRestaurant(restaurant.id);
            }
        } catch (error) {
            console.error("Failed to update favorite status", error);
            setRestaurant(prev => prev ? { ...prev, isFavorite: !newFavoriteStatus } : null);
        }
    };
    
    const handleApplyOffer = (offer: Offer) => {
        if (applyOffer(offer)) {
            window.location.hash = '#/cart';
        }
    };

    if (isLoading) {
        return <RestaurantDetailSkeleton />;
    }

    if (!restaurant) {
        return <div className="text-center py-20">Restaurant not found.</div>;
    }

    return (
        <div>
            {/* Banner */}
            <div className="h-64 relative">
                <img src={restaurant.coverImageUrl} alt={restaurant.name} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                <div className="absolute top-4 right-4">
                    <button 
                        onClick={handleToggleFavorite}
                        className="p-3 bg-white/20 rounded-full text-white hover:bg-white/40 backdrop-blur-sm transition"
                        aria-label={restaurant.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <HeartIcon isFilled={!!restaurant.isFavorite} className="w-6 h-6"/>
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h1 className="text-4xl font-extrabold">{restaurant.name}</h1>
                    <p>{restaurant.cuisine} &bull; {restaurant.address}</p>
                    <div className="flex items-center mt-2">
                        <StarIcon className="w-5 h-5 text-yellow-300 mr-1"/>
                        <span className="font-bold">{restaurant.rating}</span>
                        <span className="ml-4">{restaurant.deliveryTime}</span>
                        <span className="ml-4">${restaurant.deliveryFee.toFixed(2)} Fee</span>
                    </div>
                </div>
            </div>

            {/* Available Offers Section */}
            {restaurantOffers.length > 0 && (
                <div className="container mx-auto px-4 sm:px-6 py-4 bg-red-50 border-y border-red-100">
                    <h2 className="text-xl font-bold mb-3 text-gray-800">Available Offers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {restaurantOffers.map(offer => (
                            <div key={offer.id} className="bg-white p-4 rounded-lg border border-dashed border-red-300 flex flex-col sm:flex-row justify-between sm:items-center shadow-sm">
                                <div className="mb-3 sm:mb-0">
                                    <h3 className="font-bold text-red-600">{offer.title}</h3>
                                    <p className="text-sm text-gray-700">{offer.description}</p>
                                </div>
                                <button onClick={() => handleApplyOffer(offer)} className="bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition flex-shrink-0 self-start sm:self-center">
                                    Apply Offer
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Tabs */}
            <div className="sticky top-[68px] bg-white z-10 shadow-sm">
                <div className="container mx-auto flex">
                    <TabButton name="Menu" id="menu" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="Reviews" id="reviews" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="About" id="about" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>

            {/* Tab Content */}
            <div className="container mx-auto p-4 sm:p-6">
                {activeTab === 'menu' && <MenuSection menu={menu} restaurantId={restaurantId} onFoodClick={onFoodClick} />}
                {activeTab === 'reviews' && <ReviewsSection reviews={reviews} />}
                {activeTab === 'about' && <AboutSection restaurant={restaurant} />}
            </div>

            <StickyCartSummary />
        </div>
    );
};

const TabButton: React.FC<{ name: string, id: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void }> = ({ name, id, activeTab, setActiveTab }) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`py-4 px-6 font-semibold text-lg transition-colors duration-300 ${activeTab === id ? 'text-red-500 border-b-4 border-red-500' : 'text-gray-500 hover:text-red-400'}`}
    >
        {name}
    </button>
);

const MenuItemCard: React.FC<{ item: MenuItem, restaurantId: string, onFoodClick: (id: string) => void }> = ({ item, restaurantId, onFoodClick }) => {
    const { cartItems, addItem, updateQuantity, removeItem } = useCart();
    const cartItem = cartItems.find(ci => ci.baseItem.id === item.id && ci.selectedCustomizations.length === 0);
    const hasCustomizations = item.customizationOptions && item.customizationOptions.length > 0;

    const handleDecrement = () => {
        if (cartItem) {
            if (cartItem.quantity > 1) {
                updateQuantity(cartItem.cartItemId, cartItem.quantity - 1);
            } else {
                removeItem(cartItem.cartItemId);
            }
        }
    };

    return (
        <div 
          onClick={() => onFoodClick(item.id)}
          className="bg-white p-4 rounded-lg shadow flex space-x-4 cursor-pointer hover:shadow-lg transition-shadow"
        >
            <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-md object-cover"/>
            <div className="flex-1">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                 {item.isPackage && <span className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded-full mt-2 inline-block">PACKAGE</span>}
            </div>
            <div onClick={(e) => e.stopPropagation()} className="text-right flex flex-col justify-between items-end">
                <p className="font-bold text-gray-800">${item.price.toFixed(2)}{hasCustomizations ? '+' : ''}</p>
                {hasCustomizations ? (
                    <button onClick={() => onFoodClick(item.id)} className="bg-gray-100 text-gray-700 font-bold py-1 px-3 text-sm rounded-full hover:bg-gray-200 transition">
                        Customize
                    </button>
                ) : cartItem ? (
                    <QuantityControl 
                        quantity={cartItem.quantity}
                        onIncrement={() => updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                        onDecrement={handleDecrement}
                    />
                ) : (
                    <button onClick={() => addItem(item, 1, [], item.price)} className="bg-red-100 text-red-600 font-bold py-1 px-3 text-sm rounded-full hover:bg-red-500 hover:text-white transition">
                        Add
                    </button>
                )}
            </div>
        </div>
    );
};

const MenuSection: React.FC<{ menu: MenuCategory[], restaurantId: string, onFoodClick: (id: string) => void }> = ({ menu, restaurantId, onFoodClick }) => (
    <div>
        {menu.map(category => (
            <div key={category.name} className="mb-8">
                <h2 className="text-2xl font-bold border-l-4 border-red-500 pl-3 mb-4">{category.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {category.items.map(item => <MenuItemCard key={item.id} item={item} restaurantId={restaurantId} onFoodClick={onFoodClick} />)}
                </div>
            </div>
        ))}
    </div>
);

const ReviewsSection: React.FC<{ reviews: Review[] }> = ({ reviews }) => (
    <div>
        {reviews.map(review => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow mb-4 flex space-x-4">
                <img src={review.avatarUrl} alt={review.author} className="w-12 h-12 rounded-full"/>
                <div>
                    <div className="flex items-center mb-1">
                        <h3 className="font-bold mr-4">{review.author}</h3>
                        <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 mr-1"/>
                            <span className="font-semibold">{review.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <p className="text-gray-600">{review.text}</p>
                </div>
            </div>
        ))}
    </div>
);

const AboutSection: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">{restaurant.name}</h2>
        <p className="text-gray-600 mb-2"><strong>Cuisine:</strong> {restaurant.cuisine}</p>
        <p className="text-gray-600 mb-2"><strong>Address:</strong> {restaurant.address}</p>
        <p className="text-gray-600">
            Welcome to {restaurant.name}, where we serve the finest {restaurant.cuisine} dishes in town. Our commitment to quality ingredients and exceptional service makes us a favorite among locals and visitors alike. Join us for an unforgettable dining experience.
        </p>
    </div>
);

export default RestaurantDetailPage;