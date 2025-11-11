import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import * as api from '../services/api';
import * as tracking from '../services/tracking';
import type { Address, Order, CartItem, Offer } from '../types';
import AddressModal from '../components/AddressModal';
import { useNotification } from '../contexts/NotificationContext';

interface CheckoutPageProps {}

const AddressSectionSkeleton = () => (
    <div className="space-y-3 animate-pulse">
        {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg flex items-start space-x-4">
                <div className="w-5 h-5 bg-gray-200 rounded-full mt-1 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        ))}
    </div>
);

const CheckoutPage: React.FC<CheckoutPageProps> = () => {
    const { cartItems, cartTotal, clearCart, deliveryFee, numberOfRestaurants, appliedOffer, applyOffer, removeOffer, discountAmount } = useCart();
    const { showNotification } = useNotification();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [deliveryOption, setDeliveryOption] = useState('home');
    const [paymentOption, setPaymentOption] = useState('cod');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isAddressLoading, setIsAddressLoading] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const currentDeliveryFee = useMemo(() => {
        return deliveryOption === 'home' ? deliveryFee : 0;
    }, [deliveryOption, deliveryFee]);

    const onlinePaymentDiscount = useMemo(() => {
        return paymentOption === 'online' ? cartTotal * 0.05 : 0;
    }, [paymentOption, cartTotal]);

    const currentGrandTotal = useMemo(() => {
        return Math.max(0, cartTotal + currentDeliveryFee - discountAmount - onlinePaymentDiscount);
    }, [cartTotal, currentDeliveryFee, discountAmount, onlinePaymentDiscount]);

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


    useEffect(() => {
        setIsAddressLoading(true);
        api.getAddresses().then(data => {
            setAddresses(data);
            if (data.length > 0) {
                setSelectedAddress(data[0].id);
            }
        }).finally(() => {
            setIsAddressLoading(false);
        });
    }, []);

    const handleAddressAdded = () => {
        setIsAddressModalOpen(false);
        setIsAddressLoading(true);
        api.getAddresses().then(data => {
            setAddresses(data);
            if(data.length > 0) {
                // Select the newly added address, which will be the last one in the list
                setSelectedAddress(data[data.length - 1].id);
            }
        }).finally(() => {
            setIsAddressLoading(false);
        });
    };
    
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        try {
            const offer = await api.validateCoupon(couponCode.trim());
            if (offer) {
                applyOffer(offer);
                setCouponCode('');
            } else {
                showNotification('Invalid or expired coupon code.', 'error');
            }
        } catch (error) {
            showNotification('Could not apply coupon. Please try again.', 'error');
        } finally {
            setIsApplyingCoupon(false);
        }
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
        
        const totalDiscount = discountAmount + onlinePaymentDiscount;

        const orderPayload: Omit<Order, 'id' | 'status' | 'restaurantName' | 'date'> = {
            items: cartItems,
            subtotal: cartTotal,
            deliveryFee: currentDeliveryFee,
            total: currentGrandTotal,
            discount: totalDiscount,
            appliedOfferId: appliedOffer?.id,
            address,
            paymentMethod: paymentOption,
            deliveryOption,
        };
        
        try {
            const newOrder = await api.createOrder(orderPayload);
            tracking.trackEvent('place_order', {
                orderId: newOrder.id,
                total: newOrder.total,
                subtotal: newOrder.subtotal,
                deliveryFee: newOrder.deliveryFee,
                discount: newOrder.discount,
                itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
                restaurantIds: [...new Set(cartItems.map(item => item.baseItem.restaurantId))],
            });
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
                            {isAddressLoading ? (
                                <AddressSectionSkeleton />
                            ) : (
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
                            )}
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
                                        <div key={item.cartItemId} className="ml-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="truncate pr-2">{item.quantity} x {item.baseItem.name}</span>
                                                <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                                            </div>
                                            {item.selectedCustomizations.length > 0 && (
                                                <div className="text-xs text-gray-500 pl-2">
                                                    {item.selectedCustomizations.map(cust => cust.choices.map(c => c.name).join(', ')).join(' • ')}
                                                </div>
                                            )}
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
                                {appliedOffer && (
                                   <div className="flex justify-between text-sm text-green-600">
                                       <span className="font-semibold">{appliedOffer.title}</span>
                                       <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                                   </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span>Delivery Fee {numberOfRestaurants > 1 && deliveryOption === 'home' ? `(${numberOfRestaurants} restaurants)`: ''}</span>
                                    <span className="font-semibold">${currentDeliveryFee.toFixed(2)}</span>
                                </div>
                                {onlinePaymentDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span className="font-semibold">Online Payment Discount (5%)</span>
                                        <span className="font-semibold">-${onlinePaymentDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg text-black mt-2 pt-2 border-t">
                                    <span>Total</span>
                                    <span>${currentGrandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                {appliedOffer ? (
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-md">
                                        <p className="text-sm font-semibold text-green-700">
                                            Applied: <span className="font-bold">{appliedOffer.couponCode || appliedOffer.title}</span>
                                        </p>
                                        <button onClick={removeOffer} className="text-xs text-red-500 hover:underline font-semibold">Remove</button>
                                    </div>
                                ) : (
                                    <div className="flex space-x-2">
                                        <input 
                                            type="text" 
                                            placeholder="Enter coupon code" 
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                        <button onClick={handleApplyCoupon} disabled={isApplyingCoupon} className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-md hover:bg-black disabled:bg-gray-400">
                                            {isApplyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
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