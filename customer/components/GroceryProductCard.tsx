
import React from 'react';
import type { Food, MenuItem } from '@shared/types';
import { PlusIcon } from '@components/Icons';
import { useCart } from '@contexts/CartContext';

interface GroceryProductCardProps {
  food: Food;
}

const GroceryProductCard: React.FC<GroceryProductCardProps> = ({ food }) => {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const menuItem: MenuItem = {
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        imageUrl: food.imageUrl,
        restaurantId: food.restaurantId,
        restaurantName: food.vendor.name,
        category: food.category,
        availability: food.availability
    };
    addItem(menuItem, 1, [], food.price);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full group hover:shadow-md transition-shadow">
      <div className="relative w-full pt-[100%] bg-gray-50">
        <img 
            src={food.imageUrl} 
            alt={food.name} 
            className="absolute top-0 left-0 w-full h-full object-contain p-4 mix-blend-multiply"
        />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="mb-1">
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight min-h-[2.5em]" title={food.name}>
                {food.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{food.description}</p>
        </div>
        
        <div className="mt-auto flex items-center justify-between pt-2">
            <div>
                <span className="block text-xs text-gray-400 line-through">৳{(food.price * 1.1).toFixed(2)}</span>
                <span className="block text-sm font-bold text-gray-900">৳{food.price.toFixed(2)}</span>
            </div>
            <button 
                onClick={handleAdd}
                className="w-8 h-8 rounded-full border border-green-500 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition-colors"
            >
                <PlusIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default GroceryProductCard;
