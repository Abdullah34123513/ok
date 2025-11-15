import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { Rider } from '@shared/types';
import * as api from '@shared/api';

interface AuthContextType {
  currentRider: Rider | null;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const RIDER_STORAGE_KEY = 'foodie-find-rider-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRider, setCurrentRider] = useState<Rider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRider = localStorage.getItem(RIDER_STORAGE_KEY);
      if (storedRider) {
        setCurrentRider(JSON.parse(storedRider));
      }
    } catch (error) {
      console.error("Failed to load rider from local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (phone: string) => {
    const rider = await api.loginRider(phone);
    if (rider) {
        setCurrentRider(rider);
        localStorage.setItem(RIDER_STORAGE_KEY, JSON.stringify(rider));
        window.location.hash = '#/dashboard';
    } else {
        throw new Error("Could not log in rider.");
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentRider(null);
    localStorage.removeItem(RIDER_STORAGE_KEY);
    window.location.hash = '#/login';
  }, []);

  const value = {
    currentRider,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};