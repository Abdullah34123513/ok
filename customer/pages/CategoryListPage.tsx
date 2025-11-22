
import React, { useState, useEffect } from 'react';
import type { Food, Restaurant, Area } from '@shared/types';
import * as api from '@shared/api';
import FoodCard from '@components/FoodCard';
import RestaurantCard from '@components/RestaurantCard';
import GroceryProductCard from '@components/GroceryProductCard';
import { SkeletonCard } from '@shared/components/Skeletons';

interface CategoryListPageProps {
    categoryId: string;
    area: Area;
}

const CategoryTile: React.FC<{ label: string; image: string; onClick?: () => void; active?: boolean }> = ({ label, image, onClick, active }) => (
    <div 
        onClick={onClick}
        className={`flex flex-col items-center cursor-pointer min-w-[70px] ${active ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
    >
        <div className={`w-14 h-14 rounded-full bg-white shadow-sm p-2 mb-1 flex items-center justify-center border ${active ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-100'}`}>
            <img src={image} alt={label} className="w-full h-full object-contain" />
        </div>
        <span className={`text-xs text-center font-medium ${active ? 'text-green-600' : 'text-gray-600'}`}>{label}</span>
    </div>
);

const CategoryListPage: React.FC<CategoryListPageProps> = ({ categoryId, area }) => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [groceryProducts, setGroceryProducts] = useState<Food[]>([]);
    const [filteredGroceryProducts, setFilteredGroceryProducts] = useState<Food[]>([]);
    const [stores, setStores] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSubCategory, setActiveSubCategory] = useState('All');
    
    const isGrocery = categoryId.toLowerCase() === 'grocery';
    const title = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

    const grocerySubCategories = [
        { label: 'All', image: 'https://cdn-icons-png.flaticon.com/512/706/706164.png' },
        { label: 'Dairy', image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png' },
        { label: 'Bakery', image: 'https://cdn-icons-png.flaticon.com/512/992/992747.png' },
        { label: 'Fruits', image: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png' },
        { label: 'Veg', image: 'https://cdn-icons-png.flaticon.com/512/2153/2153786.png' },
        { label: 'Meat', image: 'https://cdn-icons-png.flaticon.com/512/1046/1046774.png' },
        { label: 'Snacks', image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setFoods([]);
            setStores([]);
            setGroceryProducts([]);
            try {
                if (isGrocery) {
                    const products = await api.getGroceryProducts(area.id);
                    setGroceryProducts(products);
                    setFilteredGroceryProducts(products);
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

    useEffect(() => {
        if (!isGrocery) return;
        
        if (activeSubCategory === 'All') {
            setFilteredGroceryProducts(groceryProducts);
        } else {
            setFilteredGroceryProducts(groceryProducts.filter(p => 
                p.category?.toLowerCase() === activeSubCategory.toLowerCase() || 
                p.name.toLowerCase().includes(activeSubCategory.toLowerCase())
            ));
        }
    }, [activeSubCategory, groceryProducts, isGrocery]);

    const onFoodClick = (id: string) => {
        window.location.hash = `#/food/${id}`;
    };

    if (isGrocery) {
        return (
            <div className="min-h-screen bg-gray-50 pb-10">
                {/* Grocery Banner */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-4 mb-6">
                    <div className="container mx-auto flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-extrabold mb-2">Fresh Groceries</h1>
                            <p className="text-green-100">Delivered to your doorstep in minutes.</p>
                        </div>
                        <img src="https://cdn-icons-png.flaticon.com/512/3082/3082031.png" alt="Grocery" className="w-24 h-24 object-contain opacity-80 hidden sm:block" />
                    </div>
                </div>

                <div className="container mx-auto px-4">
                    {/* Sub Categories */}
                    <div className="flex overflow-x-auto space-x-4 pb-6 mb-4 scrollbar-hide">
                        {grocerySubCategories.map(cat => (
                            <CategoryTile 
                                key={cat.label}
                                label={cat.label}
                                image={cat.image}
                                active={activeSubCategory === cat.label}
                                onClick={() => setActiveSubCategory(cat.label)}
                            />
                        ))}
                    </div>

                    {/* Product Grid */}
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {activeSubCategory === 'All' ? 'All Products' : `${activeSubCategory}`}
                    </h2>
                    
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : filteredGroceryProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredGroceryProducts.map(product => (
                                <div key={product.id} onClick={() => onFoodClick(product.id)} className="cursor-pointer">
                                    <GroceryProductCard food={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-lg shadow">
                            <p className="text-gray-500 text-lg">No grocery items found for this category.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default View for other categories
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{title} in {area.name}</h1>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <>
                    {foods.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {foods.map(food => (
                                <FoodCard key={food.id} food={food} onFoodClick={onFoodClick} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-lg shadow">
                            <p className="text-gray-500 text-lg">No {title} items found in your area.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryListPage;
