
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, SignupData } from '../../shared/types';
import * as api from '../../shared/api';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'foodie-find-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (user: User, token: string) => {
    const userWithToken = { ...user, authToken: token };
    setCurrentUser(userWithToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithToken));
    window.location.hash = '#/home';
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, token } = await api.login(credentials);
    handleAuthSuccess(user, token);
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const { user, token } = await api.signup(data);
    handleAuthSuccess(user, token);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    window.location.hash = '#/login';
  }, []);

  const value = {
    currentUser,
    isLoading,
    login,
    signup,
    logout,
  };

  // Don't render children until we've checked for a logged in user
  if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading application...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
