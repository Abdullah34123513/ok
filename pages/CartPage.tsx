import React, { useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { TrashIcon } from '../components/Icons';
import QuantityControl from '../components/QuantityControl';
import type { View } from '../App';
import type { CartItem } from '../types';

interface CartPageProps {
    onNavigate: (view: View) => void;
}

const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
    const { updateQuantity, removeItem } = useCart();
    
    const handleDecrement = () => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        } else {
            removeItem(item.id);
        }
    };

    return (
        <div className="flex items-center py-4 border-b">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-md object-cover mr-4" />
            <div className="flex-grow">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-gray-600 font-semibold">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center space-x-4">
                <QuantityControl
                    quantity={item.quantity}
                    onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                    onDecrement={handleDecrement}
                />
                <p className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-500 p-2">
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
    const { cartItems, cartTotal, deliveryFee, grandTotal, isLoading, numberOfRestaurants } = useCart();

    const groupedItems = useMemo(() => {
        // FIX: Provide a generic type argument to `reduce` to correctly type the accumulator.
        return cartItems.reduce<Record<string, { restaurantName: string, items: CartItem[] }>>((acc, item) => {
            const restaurantId = item.restaurantId;
            if (!acc[restaurantId]) {
                acc[restaurantId] = {
                    restaurantName: item.restaurantName,
                    items: []
                };
            }
            acc[restaurantId].items.push(item);
            return acc;
        }, {});
    }, [cartItems]);

    if (isLoading) {
        return <div className="text-center p-10">Loading cart...</div>;
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center p-10 container mx-auto">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
                <button onClick={() => onNavigate('home')} className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-3">Your Order</h2>
                    <div>
                        {Object.entries(groupedItems).map(([restaurantId, group]) => (
                            <div key={restaurantId} className="mb-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{group.restaurantName}</h3>
                                {group.items.map(item => <CartItemRow key={item.id} item={item} />)}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-3">Price Summary</h2>
                        <div className="space-y-3 text-gray-700">
                           <div className="flex justify-between">
                               <span>Subtotal</span>
                               <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                           </div>
                            <div className="flex justify-between">
                               <span>Delivery Fee {numberOfRestaurants > 1 ? `(${numberOfRestaurants} restaurants)`: ''}</span>
                               <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                           </div>
                           <div className="border-t pt-3 mt-3 flex justify-between font-bold text-xl text-black">
                               <span>Total</span>
                               <span>${grandTotal.toFixed(2)}</span>
                           </div>
                        </div>
                        <button onClick={() => onNavigate('checkout')} className="w-full mt-6 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;