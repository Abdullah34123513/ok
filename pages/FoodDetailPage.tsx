import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import type { Food, Restaurant, Review, MenuItem } from '../types';
import { StarIcon } from '../components/Icons';
import { useCart } from '../contexts/CartContext';
import QuantityControl from '../components/QuantityControl';
import RelatedFoods from '../components/RelatedFoods';

interface FoodDetailPageProps {
    foodId: string;
    location: string;
}

const FoodDetailSkeleton = () => (
    <div className="container mx-auto px-4 py-6 animate-pulse">
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side: Image */}
                <div className="w-full h-96 bg-gray-200 rounded-lg"></div>

                {/* Right side: Details */}
                <div className="flex flex-col space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-2 flex-grow">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-12 bg-gray-200 rounded-lg w-48"></div>
                    </div>
                    <div className="border-t pt-4">
                        <div className="h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Reviews & Related Skeleton */}
        <div className="mt-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white p-4 rounded-lg shadow h-24"></div>
        </div>
         <div className="mt-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex space-x-4">
                 <div className="w-80 h-64 bg-white p-4 rounded-lg shadow"></div>
                 <div className="w-80 h-64 bg-white p-4 rounded-lg shadow"></div>
                 <div className="w-80 h-64 bg-white p-4 rounded-lg shadow"></div>
            </div>
        </div>
    </div>
);

const FoodDetailPage: React.FC<FoodDetailPageProps> = ({ foodId, location }) => {
    const [food, setFood] = useState<Food | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [relatedFoods, setRelatedFoods] = useState<Food[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { cartItems, addItem, updateQuantity, removeItem } = useCart();
    const cartItem = food ? cartItems.find(item => item.id === food.id) : undefined;
    
    const onFoodClick = (id: string) => {
        window.location.hash = `#/food/${id}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            window.scrollTo(0, 0);
            setIsLoading(true);
            try {
                const foodDetails = await api.getFoodDetails(foodId);
                if (!foodDetails) {
                    setIsLoading(false);
                    return;
                }
                setFood(foodDetails);

                const [restaurantData, reviewsData, relatedData] = await Promise.all([
                    api.getRestaurantDetails(foodDetails.restaurantId),
                    api.getFoodReviews(foodId),
                    api.getRelatedFoods(foodId, location)
                ]);

                setRestaurant(restaurantData || null);
                setReviews(reviewsData);
                setRelatedFoods(relatedData);

            } catch (error) {
                console.error("Failed to fetch food details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [foodId, location]);

    const handleDecrement = () => {
        if (cartItem) {
            if (cartItem.quantity > 1) {
                updateQuantity(cartItem.id, cartItem.quantity - 1);
            } else {
                removeItem(cartItem.id);
            }
        }
    };
    
    if (isLoading) {
        return <FoodDetailSkeleton />;
    }

    if (!food) {
        return <div className="text-center p-20">Food item not found.</div>;
    }

    // FIX: Construct a valid MenuItem object from the Food object, ensuring all required properties are present.
    const menuItem: MenuItem = {
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        imageUrl: food.imageUrl,
        restaurantId: food.restaurantId,
        restaurantName: food.vendor.name,
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side: Image */}
                    <div>
                        <img src={food.imageUrl} alt={food.name} className="w-full h-auto object-cover rounded-lg shadow-md" />
                    </div>

                    {/* Right side: Details */}
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{food.name}</h1>
                        <div className="flex items-center text-lg mb-4">
                            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                            <span className="font-bold text-gray-700">{food.rating}</span>
                            <span className="text-gray-500 mx-2">&bull;</span>
                            <span className="text-gray-600">{reviews.length} reviews</span>
                        </div>
                        <p className="text-gray-600 mb-6 flex-grow">{food.description}</p>
                        
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-4xl font-bold text-red-500">${food.price.toFixed(2)}</span>
                            <div className="w-48">
                                {cartItem ? (
                                    <QuantityControl
                                        quantity={cartItem.quantity}
                                        onIncrement={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                        onDecrement={handleDecrement}
                                    />
                                ) : (
                                    <button
                                        onClick={() => addItem(menuItem, food.restaurantId)}
                                        className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                                    >
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        </div>

                        {restaurant && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-gray-800 mb-2">From Restaurant:</h3>
                                <a 
                                    href={`#/restaurant/${restaurant.id}`} 
                                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
                                >
                                    <div>
                                        <p className="font-bold text-red-600">{restaurant.name}</p>
                                        <p className="text-sm text-gray-500">{restaurant.deliveryTime} &bull; ${restaurant.deliveryFee.toFixed(2)} Fee</p>
                                    </div>
                                    <span className="text-red-500 font-bold">&rarr;</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Reviews Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
                 {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white p-4 rounded-lg shadow flex space-x-4">
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
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                        <p>No reviews yet for this item.</p>
                    </div>
                )}
            </div>

            {/* Related Foods */}
            <RelatedFoods foods={relatedFoods} onFoodClick={onFoodClick} />
        </div>
    );
};

export default FoodDetailPage;