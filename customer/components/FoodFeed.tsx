import React, { useRef, useCallback } from 'react';
import type { Food } from '@shared/types';
import FoodCard from './FoodCard';

interface FoodFeedProps {
  foods: Food[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onFoodClick: (id: string) => void;
}

const FoodFeedSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
        <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-full w-1/4 animate-pulse"></div>
            </div>
        </div>
    </div>
);

const FoodFeed: React.FC<FoodFeedProps> = ({ foods, onLoadMore, hasMore, isLoading, onFoodClick }) => {
    const observer = useRef<IntersectionObserver | null>(null);
    const lastFoodElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                onLoadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, onLoadMore]);

    return (
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Popular Near You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {foods.map((food, index) => {
                    if (foods.length === index + 1) {
                        return (
                            <div ref={lastFoodElementRef} key={food.id}>
                                <FoodCard food={food} onFoodClick={onFoodClick} />
                            </div>
                        );
                    } else {
                        return <FoodCard key={food.id} food={food} onFoodClick={onFoodClick} />;
                    }
                })}
                {isLoading && Array.from({ length: 4 }).map((_, i) => <FoodFeedSkeleton key={`skeleton-${i}`} />)}
            </div>
            {!hasMore && !isLoading && foods.length > 0 && (
                <p className="text-center text-gray-500 mt-8">You've reached the end!</p>
            )}
        </div>
    );
};

export default FoodFeed;