import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { CartItem, MenuItem } from '../types';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getCart()
      .then(setCartItems)
      .finally(() => setIsLoading(false));
  }, []);

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
  }

  const numberOfRestaurants = useMemo(() => {
    if (cartItems.length === 0) return 0;
    const restaurantIds = new Set(cartItems.map(item => item.restaurantId));
    return restaurantIds.size;
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    return numberOfRestaurants > 0 ? DELIVERY_FEE * numberOfRestaurants : 0;
  }, [numberOfRestaurants]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const grandTotal = useMemo(() => cartTotal + deliveryFee, [cartTotal, deliveryFee]);

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