import React from 'react';
import type { Food, MenuItem } from '../types';
import { StarIcon } from './Icons';
import { useCart } from '../contexts/CartContext';
import QuantityControl from './QuantityControl';

interface FoodCardProps {
  food: Food;
  onFoodClick?: (id: string) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onFoodClick }) => {
  const { cartItems, addItem, updateQuantity, removeItem } = useCart();
  const cartItem = cartItems.find(item => item.id === food.id);

  const menuItem: MenuItem = {
    id: food.id,
    name: food.name,
    description: food.description,
    price: food.price,
    imageUrl: food.imageUrl,
    restaurantId: food.restaurantId,
    restaurantName: food.vendor.name,
  };

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      } else {
        removeItem(cartItem.id);
      }
    }
  };
  
  const handleCardClick = () => {
    onFoodClick?.(food.id);
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group ${onFoodClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative">
        <img src={food.imageUrl} alt={food.name} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-bold flex items-center shadow">
          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
          <span>{food.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">{food.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{food.vendor.name}</p>
        <div className="flex justify-between items-center">
          <p className="text-lg font-extrabold text-gray-900">${food.price.toFixed(2)}</p>
          <div onClick={(e) => e.stopPropagation()}>
            {cartItem ? (
              <QuantityControl 
                quantity={cartItem.quantity}
                onIncrement={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                onDecrement={handleDecrement}
              />
            ) : (
              <button 
                onClick={() => addItem(menuItem, food.restaurantId)}
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