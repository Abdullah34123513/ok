import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { CartItem, MenuItem, Offer } from '../types';
import * as api from '../services/api';

export const DELIVERY_FEE = 5.99;

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
  cartCount: number;
  cartTotal: number;
  deliveryFee: number;
  grandTotal: number;
  numberOfRestaurants: number;
  appliedOffer: Offer | null;
  applyOffer: (offer: Offer) => boolean;
  removeOffer: () => void;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getCart()
      .then(setCartItems)
      .finally(() => setIsLoading(false));
  }, []);

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

  const applyOffer = (offer: Offer) => {
    if (offer.minOrderValue && cartTotal < offer.minOrderValue) {
        return false; // Cart total doesn't meet minimum requirement
    }
    if (offer.restaurantId && !cartItems.some(item => item.restaurantId === offer.restaurantId)) {
        return false; // Offer is for a specific restaurant not in the cart
    }
    setAppliedOffer(offer);
    return true;
  };

  const removeOffer = () => {
      setAppliedOffer(null);
  };

  const addItem = async (item: MenuItem, restaurantId: string) => {
    const updatedCart = await api.addToCart(item, restaurantId);
    setCartItems(updatedCart);
  };

  const removeItem = async (itemId: string) => {
    const updatedCart = await api.removeCartItem(itemId);
    setCartItems(updatedCart);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const updatedCart = await api.updateCartItemQuantity(itemId, quantity);
    setCartItems(updatedCart);
  };
  
  const clearCart = () => {
      // In a real app this would call an API
      setCartItems([]);
      removeOffer();
  }

  const numberOfRestaurants = useMemo(() => {
    if (cartItems.length === 0) return 0;
    const restaurantIds = new Set(cartItems.map(item => item.restaurantId));
    return restaurantIds.size;
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    return numberOfRestaurants > 0 ? DELIVERY_FEE * numberOfRestaurants : 0;
  }, [numberOfRestaurants]);
  
  const discountAmount = useMemo(() => {
    if (!appliedOffer || cartTotal === 0) return 0;

    let applicableTotal = cartTotal;
    // If offer is for a specific restaurant, calculate total for only its items
    if (appliedOffer.restaurantId) {
        applicableTotal = cartItems
            .filter(item => item.restaurantId === appliedOffer.restaurantId)
            .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    let discount = 0;
    if (appliedOffer.discountType === 'percentage') {
        discount = applicableTotal * (appliedOffer.discountValue / 100);
    } else if (appliedOffer.discountType === 'fixed') {
        discount = appliedOffer.discountValue;
    }
    
    return Math.min(discount, applicableTotal);
  }, [appliedOffer, cartItems, cartTotal]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const grandTotal = useMemo(() => Math.max(0, cartTotal - discountAmount + deliveryFee), [cartTotal, discountAmount, deliveryFee]);

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isLoading,
    cartCount,
    cartTotal,
    deliveryFee,
    grandTotal,
    numberOfRestaurants,
    appliedOffer,
    applyOffer,
    removeOffer,
    discountAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};