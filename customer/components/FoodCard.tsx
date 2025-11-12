import React from 'react';
import type { Food, MenuItem } from '@shared/types';
import { StarIcon } from './Icons';
import { useCart } from '../contexts/CartContext';
import QuantityControl from './QuantityControl';

interface FoodCardProps {
  food: Food;
  onFoodClick?: (id: string) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onFoodClick }) => {
  const { cartItems, addItem, updateQuantity, removeItem } = useCart();
  // Note: This simple check won't find customized items. Cart logic is now more complex.
  // This UI is primarily for simple, non-customized adds.
  const cartItem = cartItems.find(item => item.baseItem.id === food.id && item.selectedCustomizations.length === 0);

  const menuItem: MenuItem = {
    id: food.id,
    name: food.name,
    description: food.description,
    price: food.price,
    imageUrl: food.imageUrl,
    restaurantId: food.restaurantId,
    restaurantName: food.vendor.name,
    customizationOptions: food.customizationOptions,
  };

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(cartItem.cartItemId, cartItem.quantity - 1);
      } else {
        removeItem(cartItem.cartItemId);
      }
    }
  };
  
  const handleCardClick = () => {
    onFoodClick?.(food.id);
  }

  const hasCustomizations = food.customizationOptions && food.customizationOptions.length > 0;

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group flex flex-col ${onFoodClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative">
        <img src={food.imageUrl} alt={food.name} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-bold flex items-center shadow">
          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
          <span>{food.rating}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800 truncate">{food.name}</h3>
        <p className="text-sm text-gray-500 mb-2 flex-grow">{food.vendor.name}</p>
        <div className="flex justify-between items-center">
          <p className="text-lg font-extrabold text-gray-900">${food.price.toFixed(2)}{hasCustomizations ? '+' : ''}</p>
          <div onClick={(e) => e.stopPropagation()}>
            {hasCustomizations ? (
                <button 
                  onClick={handleCardClick}
                  className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-full group-hover:bg-gray-200 transition-colors duration-300"
                >
                  Customize
                </button>
            ) : cartItem ? (
              <QuantityControl 
                quantity={cartItem.quantity}
                onIncrement={() => updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                onDecrement={handleDecrement}
              />
            ) : (
              <button 
                onClick={() => addItem(menuItem, 1, [], menuItem.price)}
                className="bg-red-100 text-red-600 font-bold py-2 px-4 rounded-full group-hover:bg-red-500 group-hover:text-white transition-colors duration-300"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;