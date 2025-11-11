import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { CartItem, MenuItem, Offer, AppliedOffer, SelectedCustomization } from '../types';
import * as api from '../services/api';
import * as tracking from '../services/tracking';
import { useNotification } from './NotificationContext';

export const DELIVERY_FEE = 5.99;

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: MenuItem, quantity: number, customizations: SelectedCustomization[], totalPrice: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
  cartCount: number;
  cartTotal: number;
  deliveryFee: number;
  grandTotal: number;
  numberOfRestaurants: number;
  appliedOffer: AppliedOffer | null;
  applyOffer: (offer: Offer) => boolean;
  removeOffer: () => void;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    setIsLoading(true);
    api.getCart()
      .then(setCartItems)
      .finally(() => setIsLoading(false));
  }, []);

  const addItem = async (item: MenuItem, quantity: number, customizations: SelectedCustomization[], totalPrice: number) => {
    const updatedCart = await api.addToCart(item, quantity, customizations, totalPrice);
    tracking.trackEvent('add_to_cart', {
        itemId: item.id,
        itemName: item.name,
        price: totalPrice,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        customizations: customizations,
    });
    setCartItems(updatedCart);
  };

  const removeItem = async (cartItemId: string) => {
    const itemToRemove = cartItems.find(item => item.cartItemId === cartItemId);
    const updatedCart = await api.removeCartItem(cartItemId);
    if(itemToRemove) {
        tracking.trackEvent('remove_from_cart', {
            itemId: itemToRemove.baseItem.id,
            itemName: itemToRemove.baseItem.name,
            price: itemToRemove.totalPrice,
            restaurantId: itemToRemove.baseItem.restaurantId
        });
    }
    setCartItems(updatedCart);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const updatedCart = await api.updateCartItemQuantity(cartItemId, quantity);
    setCartItems(updatedCart);
  };
  
  const removeOffer = () => {
    setAppliedOffer(null);
  };

  const clearCart = () => {
      // In a real app this would call an API
      setCartItems([]);
      removeOffer();
  }

  const numberOfRestaurants = useMemo(() => {
    if (cartItems.length === 0) return 0;
    const restaurantIds = new Set(cartItems.map(item => item.baseItem.restaurantId));
    return restaurantIds.size;
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    return numberOfRestaurants > 0 ? DELIVERY_FEE * numberOfRestaurants : 0;
  }, [numberOfRestaurants]);

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.totalPrice, 0), [cartItems]);
  
  const calculateDiscount = (offer: Offer, items: CartItem[], subtotal: number): number => {
    let applicableSubtotal = 0;
    if (offer.applicableTo === 'ALL') {
        applicableSubtotal = subtotal;
    // FIX: Added a type guard to ensure `offer.applicableTo` is an object before accessing its properties.
    } else if (offer.applicableTo && typeof offer.applicableTo === 'object' && 'type' in offer.applicableTo && offer.applicableTo.type === 'RESTAURANT') {
        applicableSubtotal = items
            .filter(item => item.baseItem.restaurantId === offer.applicableTo.id)
            .reduce((sum, item) => sum + item.totalPrice, 0);
    }

    if (applicableSubtotal === 0) return 0;

    let discount = 0;
    if (offer.discountType === 'PERCENTAGE' && offer.discountValue) {
        discount = applicableSubtotal * (offer.discountValue / 100);
    } else if (offer.discountType === 'FIXED' && offer.discountValue) {
        discount = offer.discountValue;
    }

    return Math.min(discount, applicableSubtotal);
  };
  
  const applyOffer = (offer: Offer) => {
    if (offer.id === appliedOffer?.id) {
        showNotification('This offer is already applied.', 'error');
        return false;
    }

    if (offer.minOrderValue && cartTotal < offer.minOrderValue) {
        showNotification(`Minimum order of $${offer.minOrderValue.toFixed(2)} required.`, 'error');
        return false;
    }
    
    const discountAmount = calculateDiscount(offer, cartItems, cartTotal);

    if (discountAmount <= 0) {
        showNotification(`This offer isn't applicable to any items in your cart.`, 'error');
        return false;
    }
    
    setAppliedOffer({ ...offer, discountAmount });
    showNotification(`Offer "${offer.title}" applied successfully!`, 'success');
    tracking.trackEvent('apply_offer', {
        offerId: offer.id,
        offerTitle: offer.title,
        couponCode: offer.couponCode,
        discountAmount,
    });
    return true;
  };

  useEffect(() => {
    // Re-validate applied offer if cart changes
    if (appliedOffer) {
        const discountAmount = calculateDiscount(appliedOffer, cartItems, cartTotal);
        if (discountAmount > 0 && (!appliedOffer.minOrderValue || cartTotal >= appliedOffer.minOrderValue)) {
            setAppliedOffer(prev => prev ? { ...prev, discountAmount } : null);
        } else {
            removeOffer();
            showNotification('An applied offer is no longer valid for your cart and has been removed.', 'error');
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, cartTotal]);


  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const discountAmount = useMemo(() => appliedOffer?.discountAmount || 0, [appliedOffer]);
  const grandTotal = useMemo(() => Math.max(0, cartTotal + deliveryFee - discountAmount), [cartTotal, deliveryFee, discountAmount]);

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