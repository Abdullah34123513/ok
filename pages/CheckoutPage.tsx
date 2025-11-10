import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import * as api from '../services/api';
import type { Address, Order, CartItem } from '../types';
import AddressModal from '../components/AddressModal';
import { useNotification } from '../contexts/NotificationContext';

interface CheckoutPageProps {}

const CheckoutPage: React.FC<CheckoutPageProps> = () => {
    const { cartItems, cartTotal, clearCart, deliveryFee, numberOfRestaurants } = useCart();
    const { showNotification } = useNotification();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [deliveryOption, setDeliveryOption] = useState('home');
    const [paymentOption, setPaymentOption] = useState('cod');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const currentDeliveryFee = useMemo(() => {
        return deliveryOption === 'home' ? deliveryFee : 0;
    }, [deliveryOption, deliveryFee]);

    const currentGrandTotal = useMemo(() => {
        return cartTotal + currentDeliveryFee;
    }, [cartTotal, currentDeliveryFee]);

    const groupedItems = useMemo(() => {
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


    useEffect(() => {
        api.getAddresses().then(data => {
            setAddresses(data);
            if (data.length > 0) {
                setSelectedAddress(data[0].id);
            }
        });
    }, []);

    const handleAddressAdded = () => {
        setIsAddressModalOpen(false);
        api.getAddresses().then(data => {
            setAddresses(data);
            if(data.length > 0) {
                // Select the newly added address, which will be the last one in the list
                setSelectedAddress(data[data.length - 1].id);
            }
        });
    };
    
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            showNotification("Please select a delivery address.", "error");
            return;
        }
        if (cartItems.length === 0) {
            showNotification("Your cart is empty and you cannot place an order.", "error");
            return;
        }

        setIsPlacingOrder(true);
        const address = addresses.find(a => a.id === selectedAddress);
        if (!address) {
            showNotification("Selected address not found. Please try again.", "error");
            setIsPlacingOrder(false);
            return;
        };
        
        const orderPayload: Omit<Order, 'id' | 'status' | 'restaurantName' | 'date'> = {
            items: cartItems,
            subtotal: cartTotal,
            deliveryFee: currentDeliveryFee,
            total: currentGrandTotal,
            address,
            paymentMethod: paymentOption,
            deliveryOption,
        };
        
        try {
            const newOrder = await api.createOrder(orderPayload);
            clearCart();
            window.location.hash = `#/confirmation/${newOrder.id}`;
        } catch (error) {
            console.error("Failed to place order:", error);
            showNotification("There was an issue placing your order. Please try again.", "error");
        } finally {
            setIsPlacingOrder(false);
        }
    };
    
    if (cartItems.length === 0 && !isPlacingOrder) {
         return <div className="text-center p-10">Your cart is empty. Cannot proceed to checkout.</div>;
    }

    return (
        <>
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
                            <div className="space-y-3">
                                {addresses.map(address => (
                                    <label key={address.id} className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${selectedAddress === address.id ? 'border-red-500 bg-red-50' : ''}`}>
                                        <input type="radio" name="address" value={address.id} checked={selectedAddress === address.id} onChange={(e) => setSelectedAddress(e.target.value)} className="mt-1 mr-4 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">{address.label}</p>
                                            <p className="text-gray-600 text-sm">{address.details}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <button onClick={() => setIsAddressModalOpen(true)} className="mt-4 text-red-500 font-semibold hover:text-red-600 transition">+ Add New Address</button>
                        </div>

                        {/* Delivery & Payment Options */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Delivery & Payment</h2>
                            {/* Delivery Options */}
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Delivery Option</h3>
                                <div className="flex space-x-4">
                                    <label className="flex items-center"><input type="radio" name="delivery" value="home" checked={deliveryOption === 'home'} onChange={(e) => setDeliveryOption(e.target.value)} className="mr-2"/> Home Delivery</label>
                                    <label className="flex items-center"><input type="radio" name="delivery" value="pickup" checked={deliveryOption === 'pickup'} onChange={(e) => setDeliveryOption(e.target.value)} className="mr-2"/> Pickup</label>
                                </div>
                            </div>
                            {/* Payment Options */}
                            <div>
                                <h3 className="font-semibold mb-2">Payment Option</h3>
                                <div className="flex space-x-4">
                                    <label className="flex items-center"><input type="radio" name="payment" value="cod" checked={paymentOption === 'cod'} onChange={(e) => setPaymentOption(e.target.value)} className="mr-2"/> Cash on Delivery</label>
                                    <label className="flex items-center"><input type="radio" name="payment" value="online" checked={paymentOption === 'online'} onChange={(e) => setPaymentOption(e.target.value)} className="mr-2"/> Pay Online</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                            <h2 className="text-xl font-bold mb-4 border-b pb-3">Order Summary</h2>
                            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 mb-3">
                            {/* FIX: Use Object.keys() for type-safe iteration over groupedItems. */}
                            {Object.keys(groupedItems).map((restaurantId) => (
                                <div key={restaurantId}>
                                    <h4 className="font-semibold text-sm text-gray-600 mb-1">{groupedItems[restaurantId].restaurantName}</h4>
                                    {groupedItems[restaurantId].items.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm ml-2">
                                            <span className="truncate pr-2">{item.quantity} x {item.name}</span>
                                            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                             ))}
                            </div>
                            <div className="border-t pt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Delivery Fee {numberOfRestaurants > 1 ? `(${numberOfRestaurants} restaurants)`: ''}</span>
                                    <span className="font-semibold">${currentDeliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-black mt-2 pt-2 border-t">
                                    <span>Total</span>
                                    <span>${currentGrandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || !selectedAddress}
                                className="w-full mt-6 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300 disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                                {isPlacingOrder ? (
                                    <div className="flex justify-center items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Placing Order...
                                    </div>
                                ) : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} onAddressAdded={handleAddressAdded} />}
        </>
    );
};

export default CheckoutPage;