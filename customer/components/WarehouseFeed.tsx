
import React from 'react';
import type { Food } from '@shared/types';
import { PackageIcon } from '@components/Icons';
import FoodCard from '@components/FoodCard';

interface WarehouseFeedProps {
  products: Food[];
  onProductClick: (id: string) => void;
}

const WarehouseFeed: React.FC<WarehouseFeedProps> = ({ products, onProductClick }) => {
  if (products.length === 0) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-4">
          <div className="bg-purple-600 p-2 rounded-full mr-3">
            <PackageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-gray-800">Warehouse Deals (Exclusive)</h2>
              <p className="text-sm text-gray-500">Bulk savings & essentials delivered next day.</p>
          </div>
      </div>
      
      <div className="flex overflow-x-auto pb-6 -mx-2 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-72 px-2">
            <FoodCard food={product} onFoodClick={onProductClick} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarehouseFeed;
