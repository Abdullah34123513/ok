
import React, { useState, useEffect, useMemo } from 'react';
import type { Offer, Restaurant, Food, Area } from '@shared/types';
import * as api from '@shared/api';
import { useCart } from '@contexts/CartContext';
import { StarIcon, ClockIcon, PackageIcon, ChevronRightIcon } from '@components/Icons';

// --- ICONS (Local for this specific design) ---
const FlashIcon = () => (
    <svg className="w-6 h-6 text-orange-500 fill-current" viewBox="0 0 24 24">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
);

const ShopIcon = () => (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
);

// --- SUB-COMPONENTS ---

// 1. Hero Banner Slider
const HeroSlider: React.FC<{ offers: Offer[] }> = ({ offers }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (offers.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % offers.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [offers.length]);

    if (offers.length === 0) return <div className="h-40 bg-gray-200 animate-pulse mx-4 mt-4 rounded-xl"></div>;

    return (
        <div className="relative h-40 sm:h-64 mx-4 mt-4 rounded-xl overflow-hidden shadow-sm group">
            {offers.map((offer, index) => (
                <div 
                    key={offer.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center px-6 sm:px-12">
                        <span className="text-orange-400 font-bold tracking-wider text-xs sm:text-sm uppercase mb-1">Exclusive Deal</span>
                        <h2 className="text-white text-2xl sm:text-4xl font-extrabold max-w-md leading-tight mb-2">{offer.title}</h2>
                        <p className="text-gray-200 text-xs sm:text-sm line-clamp-2 max-w-sm mb-4">{offer.description}</p>
                        <button className="bg-orange-500 text-white px-5 py-2 rounded-full font-bold text-xs sm:text-sm w-fit hover:bg-orange-600 transition">
                            Shop Now
                        </button>
                    </div>
                </div>
            ))}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                {offers.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === current ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/50'}`} />
                ))}
            </div>
        </div>
    );
};

// 2. Flash Sale Card
const FlashSaleCard: React.FC<{ food: Food; discount?: number }> = ({ food, discount = 20 }) => {
    const { addItem } = useCart();
    const originalPrice = food.price * (1 + discount / 100);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        const menuItem = {
            id: food.id, name: food.name, description: food.description, price: food.price,
            imageUrl: food.imageUrl, restaurantId: food.restaurantId, restaurantName: food.vendor.name
        };
        addItem(menuItem, 1, [], food.price);
    };

    return (
        <div 
            onClick={() => window.location.hash = `#/food/${food.id}`}
            className="bg-white w-36 sm:w-44 flex-shrink-0 flex flex-col cursor-pointer group hover:shadow-lg transition-shadow duration-300 border-r last:border-r-0 border-gray-100 first:rounded-l-lg last:rounded-r-lg"
        >
            <div className="relative w-full h-36 sm:h-44">
                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    -{discount}%
                </div>
            </div>
            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-xs sm:text-sm text-gray-800 line-clamp-2 mb-1 h-8 sm:h-10 leading-snug">{food.name}</h3>
                <div className="mt-auto">
                    <div className="text-orange-500 font-bold text-sm sm:text-base">৳{food.price.toFixed(0)}</div>
                    <div className="text-gray-400 text-xs line-through">৳{originalPrice.toFixed(0)}</div>
                </div>
            </div>
        </div>
    );
};

// 3. Category Grid Item
const CategoryTile: React.FC<{ label: string; image: string; link: string; isSpecial?: boolean }> = ({ label, image, link, isSpecial }) => (
    <a 
        href={link}
        className="flex flex-col items-center bg-white p-2 sm:p-3 border border-gray-100 hover:shadow-md transition-all cursor-pointer h-full"
    >
        <div className={`w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-full overflow-hidden ${isSpecial ? 'border-2 border-orange-500 p-0.5' : ''}`}>
            <img src={image} alt={label} className="w-full h-full object-cover rounded-full" />
        </div>
        <span className={`text-[10px] sm:text-xs text-center leading-tight ${isSpecial ? 'font-bold text-orange-600' : 'text-gray-700'}`}>{label}</span>
    </a>
);

// 4. Standard Product Card (Just For You)
const ProductCard: React.FC<{ food: Food }> = ({ food }) => {
    return (
        <div 
            onClick={() => window.location.hash = `#/food/${food.id}`}
            className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-100"
        >
            <div className="aspect-square w-full relative">
                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
                <h3 className="text-sm text-gray-800 line-clamp-2 h-10 leading-snug mb-1">{food.name}</h3>
                <div className="flex items-center justify-between">
                    <span className="text-orange-500 font-bold text-base">৳{food.price}</span>
                    <div className="flex items-center text-xs text-gray-400">
                        <StarIcon className="w-3 h-3 text-yellow-400 mr-0.5" />
                        {food.rating}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. Horizontal Store Row (Restaurant)
const StoreRow: React.FC<{ title: string; stores: Restaurant[]; color?: string }> = ({ title, stores, color = "orange" }) => {
    if (!stores.length) return null;
    
    const borderColor = color === "green" ? "border-green-500" : color === "purple" ? "border-purple-500" : "border-orange-500";
    const textColor = color === "green" ? "text-green-600" : color === "purple" ? "text-purple-600" : "text-orange-600";

    return (
        <div className="bg-white mt-4 py-4 pl-4 border-t border-b border-gray-100">
            <div className="flex justify-between items-center pr-4 mb-3">
                <h3 className={`text-lg font-bold ${textColor} uppercase tracking-tight`}>{title}</h3>
                <a href="#/restaurants" className="text-xs font-bold text-gray-500 border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-50 uppercase">Shop All</a>
            </div>
            <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide pr-4">
                {stores.map(store => (
                    <div 
                        key={store.id}
                        onClick={() => window.location.hash = `#/restaurant/${store.id}`}
                        className={`flex-shrink-0 w-32 bg-gray-50 rounded-lg overflow-hidden border ${borderColor} cursor-pointer hover:shadow-md transition-all`}
                    >
                        <div className="h-20 bg-white relative">
                            <img src={store.logoUrl} className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="p-2 text-center">
                            <p className="text-xs font-bold text-gray-800 truncate">{store.name}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{store.deliveryTime}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const HomePage: React.FC<{ area: Area }> = ({ area }) => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [flashFoods, setFlashFoods] = useState<Food[]>([]);
    const [justForYou, setJustForYou] = useState<Food[]>([]);
    const [topRestaurants, setTopRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [allOffers, foodsData, topRes] = await Promise.all([
                    api.getOffers(area.id),
                    api.getFoods(area.id, 1, 20),
                    api.getTopRestaurants(area.id)
                ]);

                setOffers(allOffers);
                // Simulate Flash Sale by picking random items
                setFlashFoods(foodsData.foods.slice(0, 6)); 
                setJustForYou(foodsData.foods.slice(6));
                setTopRestaurants(topRes);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [area.id]);

    // Categories Configuration
    const categories = [
        { label: 'Grocery', image: 'https://cdn-icons-png.flaticon.com/512/1261/1261163.png', link: '#/category/grocery', isSpecial: true },
        { label: 'Burgers', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', link: '#/category/burgers' },
        { label: 'Pizza', image: 'https://cdn-icons-png.flaticon.com/512/1404/1404945.png', link: '#/category/pizza' },
        { label: 'Dessert', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081967.png', link: '#/category/dessert' },
        { label: 'Drinks', image: 'https://cdn-icons-png.flaticon.com/512/2405/2405597.png', link: '#/category/drinks' },
        { label: 'Asian', image: 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png', link: '#/category/asian' },
        { label: 'Healthy', image: 'https://cdn-icons-png.flaticon.com/512/2515/2515183.png', link: '#/category/healthy' },
        { label: 'More', image: 'https://cdn-icons-png.flaticon.com/512/2997/2997933.png', link: '#/restaurants' },
    ];

    if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;

    return (
        <div className="bg-[#F5F5F5] min-h-screen pb-24">
            {/* 1. Hero Slider */}
            <HeroSlider offers={offers} />

            {/* 2. Categories Grid */}
            <div className="grid grid-cols-4 gap-1 sm:gap-2 mx-4 mt-4 bg-white rounded-xl overflow-hidden shadow-sm py-2">
                {categories.map((cat, idx) => (
                    <CategoryTile 
                        key={idx} 
                        label={cat.label} 
                        image={cat.image} 
                        link={cat.link}
                        isSpecial={cat.isSpecial}
                    />
                ))}
            </div>

            {/* 3. Flash Sale Section */}
            <div className="mx-4 mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <div className="flex items-center">
                        <h3 className="text-orange-500 font-bold uppercase tracking-wide text-sm sm:text-base mr-4">Flash Sale</h3>
                        <div className="hidden sm:flex items-center bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">
                            <ClockIcon className="w-3 h-3 mr-1"/> Ending in 04:23:12
                        </div>
                    </div>
                    <button className="text-orange-500 border border-orange-500 px-3 py-1 text-xs font-bold rounded hover:bg-orange-50 uppercase">
                        Shop All Products
                    </button>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide">
                    {flashFoods.map(food => (
                        <FlashSaleCard key={food.id} food={food} discount={Math.floor(Math.random() * 20) + 10} />
                    ))}
                </div>
            </div>

            {/* 4. Trending Restaurants Row */}
            <StoreRow title="Trending Restaurants" stores={topRestaurants} color="orange" />

            {/* 5. Just For You (Masonry Grid) */}
            <div className="mx-4 mt-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wide">Just For You</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {justForYou.map(food => (
                        <ProductCard key={food.id} food={food} />
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <button className="border border-gray-300 text-gray-600 px-8 py-2.5 rounded shadow-sm font-bold text-sm hover:bg-gray-50 uppercase tracking-wide">
                        Load More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
