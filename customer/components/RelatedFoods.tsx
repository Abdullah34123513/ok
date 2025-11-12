import React from 'react';
import type { Food } from '@shared/types';
import FoodCard from '@components/FoodCard';

interface RelatedFoodsProps {
  foods: Food[];
  onFoodClick: (id: string) => void;
}

const RelatedFoods: React.FC<RelatedFoodsProps> = ({ foods, onFoodClick }) => {
  if (foods.length === 0) {
    return null;
  }
  
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Related Foods</h2>
      <div className="flex overflow-x-auto pb-4 -mx-2">
        {foods.map((food) => (
          <div key={food.id} className="flex-shrink-0 w-80 px-2">
            <FoodCard food={food} onFoodClick={onFoodClick} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedFoods;
