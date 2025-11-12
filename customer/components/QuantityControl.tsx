
import React from 'react';
import { PlusIcon, MinusIcon } from './Icons';

interface QuantityControlProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

const QuantityControl: React.FC<QuantityControlProps> = ({ quantity, onIncrement, onDecrement }) => {
    return (
        <div className="flex items-center border border-gray-300 rounded-full">
            <button onClick={onDecrement} className="p-2 text-red-500 hover:bg-red-50 rounded-l-full">
                <MinusIcon />
            </button>
            <span className="px-3 font-bold text-lg">{quantity}</span>
            <button onClick={onIncrement} className="p-2 text-red-500 hover:bg-red-50 rounded-r-full">
                <PlusIcon />
            </button>
        </div>
    );
};

export default QuantityControl;
