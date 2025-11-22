
import React, { useState, useEffect } from 'react';
import * as api from '@shared/api';
import type { FlashSaleCampaign, Food, Area } from '@shared/types';
import { ClockIcon } from '@components/Icons';
import { SkeletonCard } from '@shared/components/Skeletons';

// Reusing the FlashSaleTimer logic locally or simplified for the header
const Timer: React.FC<{ endTime: string }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculate = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) return 'Expired';
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            return `${hours}h ${minutes}m ${seconds}s`;
        };
        setTimeLeft(calculate());
        const interval = setInterval(() => setTimeLeft(calculate()), 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return <span className="font-mono font-bold ml-2">{timeLeft}</span>;
};

interface FlashSaleListPageProps {
    area: Area;
}

const FlashSaleListPage: React.FC<FlashSaleListPageProps> = ({ area }) => {
    const [campaign, setCampaign] = useState<FlashSaleCampaign | null>(null);
    const [items, setItems] = useState<Food[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const config = await api.getActiveFlashSale();
                setCampaign(config);
                if (config.isActive && config.itemIds.length > 0) {
                    // Pass area.id to ensure we only get items available in this area
                    const foodItems = await api.getFoodsByIds(config.itemIds, area.id);
                    setItems(foodItems);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [area.id]);

    const handleItemClick = (id: string) => {
        window.location.hash = `#/food/${id}`;
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!campaign || !campaign.isActive) {
        return (
            <div className="container mx-auto px-4 py-20 text-center text-gray-500">
                <h2 className="text-xl font-bold mb-2">No Active Flash Sale</h2>
                <p>Check back later for amazing deals!</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Banner Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-8 px-4 mb-6">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Flash Sale</h1>
                    <div className="flex justify-center items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 w-fit mx-auto">
                        <ClockIcon className="w-5 h-5 mr-1" />
                        <span>Ending in:</span>
                        <Timer endTime={campaign.endTime} />
                    </div>
                    <p className="mt-3 font-medium text-orange-100">
                        Up to {campaign.discountPercentage}% OFF on selected items!
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map(item => {
                        const discountedPrice = item.price * (1 - campaign.discountPercentage / 100);
                        return (
                            <div 
                                key={item.id} 
                                onClick={() => handleItemClick(item.id)}
                                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
                            >
                                <div className="relative aspect-square">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        -{campaign.discountPercentage}%
                                    </div>
                                </div>
                                <div className="p-3 flex flex-col flex-grow">
                                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-2">{item.vendor.name}</p>
                                    
                                    <div className="mt-auto flex items-end space-x-2">
                                        <span className="text-lg font-bold text-orange-600">৳{discountedPrice.toFixed(0)}</span>
                                        <span className="text-xs text-gray-400 line-through mb-1">৳{item.price.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {items.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">No items found in this sale for your area.</p>
                )}
            </div>
        </div>
    );
};

export default FlashSaleListPage;
