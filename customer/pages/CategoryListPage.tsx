
import React, { useState, useEffect } from 'react';
import type { Food, Restaurant, Area } from '@shared/types';
import * as api from '@shared/api';
import FoodCard from '@components/FoodCard';
import RestaurantCard from '@components/RestaurantCard';
import { SkeletonCard } from '@shared/components/Skeletons';

interface CategoryListPageProps {
    categoryId: string;
    area: Area;
}

const CategoryListPage: React.FC<CategoryListPageProps> = ({ categoryId, area }) => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [stores, setStores] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const isGrocery = categoryId.toLowerCase() === 'grocery';
    const title = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setFoods([]);
            setStores([]);
            try {
                if (isGrocery) {
                    const data = await api.getStoresByType(area.id, 'GROCERY');
                    setStores(data);
                } else {
                    const data = await api.getFoods(area.id, 1, 50, categoryId);
                    setFoods(data.foods);
                }
            } catch (error) {
                console.error("Failed to fetch category data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [categoryId, area.id, isGrocery]);

    const onFoodClick = (id: string) => {
        window.location.hash = `#/food/${id}`;
    };

    const onStoreClick = (id: string) => {
        window.location.hash = `#/restaurant/${id}`;
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{title} in {area.name}</h1>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <>
                    {isGrocery ? (
                        stores.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {stores.map(store => (
                                    <RestaurantCard key={store.id} restaurant={store} onClick={() => onStoreClick(store.id)} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg shadow">
                                <p className="text-gray-500 text-lg">No grocery stores found in your area.</p>
                            </div>
                        )
                    ) : (
                        foods.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {foods.map(food => (
                                    <FoodCard key={food.id} food={food} onFoodClick={onFoodClick} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg shadow">
                                <p className="text-gray-500 text-lg">No {title} items found in your area.</p>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryListPage;
