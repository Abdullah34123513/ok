
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { LoginCredentials, Admin } from '@shared/types';
import * as api from '@shared/api';

interface AuthContextType {
  currentAdmin: Admin | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'foodie-find-admin-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (storedAdmin) {
        setCurrentAdmin(JSON.parse(storedAdmin));
      }
    } catch (error) {
      console.error("Failed to load admin from local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (admin: Admin) => {
    setCurrentAdmin(admin);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    window.location.hash = '#/dashboard';
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, adminId } = await api.login(credentials);
    if (!adminId) {
        throw new Error("This account is not a valid administrator account.");
    }
    
    const admin: Admin = {
        id: adminId,
        name: user.name,
        email: user.email,
        role: 'SUPER_ADMIN'
    };
    handleAuthSuccess(admin);
  }, []);

  const logout = useCallback(() => {
    setCurrentAdmin(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.location.hash = '#/login';
  }, []);

  const value = {
    currentAdmin,
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
