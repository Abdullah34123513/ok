import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { LoginCredentials, Vendor } from '@shared/types';
import * as api from '@shared/api';

interface AuthContextType {
  currentVendor: Vendor | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VENDOR_STORAGE_KEY = 'foodie-find-vendor-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedVendor = localStorage.getItem(VENDOR_STORAGE_KEY);
      if (storedVendor) {
        setCurrentVendor(JSON.parse(storedVendor));
      }
    } catch (error) {
      console.error("Failed to load vendor from local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendor));
    window.location.hash = '#/dashboard';
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, token, vendorId } = await api.login(credentials);
    if (!vendorId) {
        throw new Error("This account is not a valid vendor account.");
    }
    const vendor: Vendor = {
        id: vendorId,
        restaurantId: `restaurant-${vendorId.split('-')[1]}`, // Mock logic
        name: user.name,
    };
    handleAuthSuccess(vendor);
  }, []);

  const logout = useCallback(() => {
    setCurrentVendor(null);
    localStorage.removeItem(VENDOR_STORAGE_KEY);
    window.location.hash = '#/login';
  }, []);

  const value = {
    currentVendor,
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