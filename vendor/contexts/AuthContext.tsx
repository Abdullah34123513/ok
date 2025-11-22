
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { LoginCredentials, Vendor, Restaurant } from '@shared/types';
import * as api from '@shared/api';

interface AuthContextType {
  currentVendor: Vendor | null;
  vendorType: Restaurant['type'] | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VENDOR_STORAGE_KEY = 'foodie-find-vendor-user';
const VENDOR_TYPE_KEY = 'foodie-find-vendor-type';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [vendorType, setVendorType] = useState<Restaurant['type'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        try {
            const storedVendor = localStorage.getItem(VENDOR_STORAGE_KEY);
            const storedType = localStorage.getItem(VENDOR_TYPE_KEY);
            
            if (storedVendor) {
                const vendor = JSON.parse(storedVendor);
                setCurrentVendor(vendor);
                
                if (storedType) {
                    setVendorType(storedType as Restaurant['type']);
                } else {
                    // Fallback: fetch type if missing from storage but user exists
                    try {
                        const details = await api.getRestaurantDetails(vendor.restaurantId);
                        if (details) {
                            setVendorType(details.type);
                            localStorage.setItem(VENDOR_TYPE_KEY, details.type);
                        }
                    } catch (e) {
                        console.error("Failed to fetch restaurant type on init", e);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load vendor from local storage", error);
        } finally {
            setIsLoading(false);
        }
    };
    initAuth();
  }, []);

  const handleAuthSuccess = async (vendor: Vendor) => {
    setCurrentVendor(vendor);
    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendor));
    
    try {
        const details = await api.getRestaurantDetails(vendor.restaurantId);
        if (details) {
            setVendorType(details.type);
            localStorage.setItem(VENDOR_TYPE_KEY, details.type);
        }
    } catch (e) {
        console.error("Failed to fetch restaurant type", e);
        setVendorType('RESTAURANT'); // Default
    }

    window.location.hash = '#/dashboard';
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, vendorId } = await api.login(credentials);
    if (!vendorId) {
        throw new Error("This account is not a valid vendor account.");
    }
    // In a real app, api.login would return the full vendor object.
    // Here we reconstruct it or fetch it.
    // For this mock architecture, we construct the basic vendor object
    // The detailed fetch happens in handleAuthSuccess via getRestaurantDetails if needed
    const vendor: Vendor = {
        id: vendorId,
        restaurantId: `restaurant-${vendorId.split('-')[1]}` || `restaurant-${vendorId.replace('vendor-', '')}`, 
        name: user.name,
        email: user.email,
    };
    
    // Fix for specific mock IDs if needed, but relying on API consistency is better.
    if(vendorId === 'vendor-grocery') vendor.restaurantId = 'restaurant-grocery-1';
    if(vendorId === 'vendor-warehouse') vendor.restaurantId = 'restaurant-warehouse-1';

    await handleAuthSuccess(vendor);
  }, []);

  const logout = useCallback(() => {
    setCurrentVendor(null);
    setVendorType(null);
    localStorage.removeItem(VENDOR_STORAGE_KEY);
    localStorage.removeItem(VENDOR_TYPE_KEY);
    window.location.hash = '#/login';
  }, []);

  const value = {
    currentVendor,
    vendorType,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
