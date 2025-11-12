import React, { useMemo } from 'react';
import { useCart } from '@contexts/CartContext';
import { TrashIcon } from '@components/Icons';
import QuantityControl from '@components/QuantityControl';
import type { CartItem } from '@shared/types';

interface CartPageProps {}

const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
    const { updateQuantity, removeItem } = useCart();
    
    const handleDecrement = () => {
        if (item.quantity > 1) {
            updateQuantity(item.cartItemId, item.quantity - 1);
        } else {
            removeItem(item.cartItemId);
        }
    };

    const pricePerItem = item.totalPrice / item.quantity;

    return (
        <div className="flex items-start py-4 border-b">
            <img src={item.baseItem.imageUrl} alt={item.baseItem.name} className="w-20 h-20 rounded-md object-cover mr-4" />
            <div className="flex-grow">
                <h3 className="font-bold text-lg">{item.baseItem.name}</h3>
                {item.selectedCustomizations.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                        {item.selectedCustomizations.map(cust => (
                            <div key={cust.optionId}>
                                <strong>{cust.optionName}:</strong> {cust.choices.map(c => c.name).join(', ')}
                            </div>
                        ))}
                    </div>
                )}
                <p className="text-gray-600 font-semibold mt-1">${pricePerItem.toFixed(2)}</p>
            </div>
            <div className="flex items-center space-x-4">
                <QuantityControl
                    quantity={item.quantity}
                    onIncrement={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    onDecrement={handleDecrement}
                />
                <p className="font-bold w-20 text-right">${item.totalPrice.toFixed(2)}</p>
                <button onClick={() => removeItem(item.cartItemId)} className="text-gray-500 hover:text-red-500 p-2">
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

const CartPageSkeleton = () => (
    <div className="container mx-auto px-4 py-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 border-b pb-3"></div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center py-4 border-b space-x-4">
                        <div className="w-20 h-20 rounded-md bg-gray-200"></div>
                        <div className="flex-grow space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4 border-b pb-3"></div>
                    <div className="space-y-3">
                       <div className="flex justify-between"><div className="h-5 bg-gray-200 rounded w-1/4"></div><div className="h-5 bg-gray-200 rounded w-1/3"></div></div>
                       <div className="flex justify-between"><div className="h-5 bg-gray-200 rounded w-1/3"></div><div className="h-5 bg-gray-200 rounded w-1/4"></div></div>
                       <div className="border-t pt-3 mt-3 flex justify-between"><div className="h-6 bg-gray-200 rounded w-1/4"></div><div className="h-6 bg-gray-200 rounded w-1/3"></div></div>
                    </div>
                    <div className="mt-6 h-12 bg-gray-200 rounded-lg w-full"></div>
                </div>
            </div>
        </div>
    </div>
);


const CartPage: React.FC<CartPageProps> = () => {
    const { cartItems, cartTotal, deliveryFee, grandTotal, isLoading, numberOfRestaurants, appliedOffer, discountAmount, removeOffer } = useCart();

    const groupedItems = useMemo(() => {
        return cartItems.reduce<Record<string, { restaurantName: string, items: CartItem[] }>>((acc, item) => {
            const restaurantId = item.baseItem.restaurantId;
            if (!acc[restaurantId]) {
                acc[restaurantId] = {
                    restaurantName: item.baseItem.restaurantName,
                    items: []
                };
            }
            acc[restaurantId].items.push(item);
            return acc;
        }, {});
    }, [cartItems]);

    if (isLoading) {
        return <CartPageSkeleton />;
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center p-10 container mx-auto">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
                <a href="#/home" className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition">
                    Continue Shopping
                </a>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-3">Your Order</h2>
                    <div>
                        {Object.keys(groupedItems).map((restaurantId) => (
                            <div key={restaurantId} className="mb-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{groupedItems[restaurantId].restaurantName}</h3>
                                {groupedItems[restaurantId].items.map(item => <CartItemRow key={item.cartItemId} item={item} />)}
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
                           {appliedOffer && (
                               <div className="flex justify-between text-green-600">
                                    <div>
                                        <span className="font-semibold">Discount</span>
                                        <button onClick={removeOffer} className="ml-2 text-xs text-red-500 hover:underline">[Remove]</button>
                                    </div>
                                   <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                               </div>
                           )}
                           <div className="flex justify-between">
                               <span>Delivery Fee {numberOfRestaurants > 1 ? `(${numberOfRestaurants} restaurants)`: ''}</span>
                               <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                           </div>
                           <div className="border-t pt-3 mt-3 flex justify-between font-bold text-xl text-black">
                               <span>Total</span>
                               <span>${grandTotal.toFixed(2)}</span>
                           </div>
                        </div>
                        <a href="#/checkout" className="block text-center w-full mt-6 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300">
                            Proceed to Checkout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
