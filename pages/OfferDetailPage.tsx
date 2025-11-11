import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import type { Offer, Food } from '../types';
import FoodCard from '../components/FoodCard';

interface OfferDetailPageProps {
    offerId: string;
    location: string;
}

const OfferDetailSkeleton = () => (
    <div className="container mx-auto px-4 py-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
        
        {/* Title Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-6"></div>

        {/* Food Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-4">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-10 bg-gray-200 rounded-full w-1/4"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const OfferDetailPage: React.FC<OfferDetailPageProps> = ({ offerId, location }) => {
    const [offer, setOffer] = useState<Offer | null>(null);
    const [foods, setFoods] = useState<Food[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [offerDetails, offerFoods] = await Promise.all([
                    api.getOfferDetails(offerId),
                    api.getFoodsForOffer(offerId, location)
                ]);
                setOffer(offerDetails || null);
                setFoods(offerFoods);
            } catch (error) {
                console.error("Failed to fetch offer details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [offerId, location]);

    const onFoodClick = (id: string) => {
        window.location.hash = `#/food/${id}`;
    };

    if (isLoading) {
        return <OfferDetailSkeleton />;
    }

    if (!offer) {
        return <div className="text-center py-20">Offer not found.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <img src={offer.imageUrl} alt={offer.title} className="w-full h-auto max-h-72 object-cover rounded-lg shadow-lg"/>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{offer.title}</h1>
            <p className="text-gray-600 mb-6 max-w-3xl">{offer.description}</p>
            
            {foods.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {foods.map(food => (
                        <FoodCard key={food.id} food={food} onFoodClick={onFoodClick} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-600">There are no specific items for this offer in your area.</p>
                </div>
            )}
        </div>
    );
};

export default OfferDetailPage;