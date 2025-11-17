import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { LoginCredentials, Moderator } from '@shared/types';
import * as api from '@shared/api';

interface AuthContextType {
  currentModerator: Moderator | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MODERATOR_STORAGE_KEY = 'foodie-find-moderator-user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentModerator, setCurrentModerator] = useState<Moderator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedModerator = localStorage.getItem(MODERATOR_STORAGE_KEY);
      if (storedModerator) {
        setCurrentModerator(JSON.parse(storedModerator));
      }
    } catch (error) {
      console.error("Failed to load moderator from local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = (moderator: Moderator) => {
    setCurrentModerator(moderator);
    localStorage.setItem(MODERATOR_STORAGE_KEY, JSON.stringify(moderator));
    window.location.hash = '#/dashboard';
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, moderatorId } = await api.login(credentials);
    if (!moderatorId) {
        throw new Error("This account is not a valid moderator account.");
    }
    // In a real app we'd fetch moderator details. Here we construct it.
    const moderator: Moderator = {
        id: moderatorId,
        name: user.name,
        email: user.email,
        permissions: ['manage_users', 'review_content'] // Mock permissions
    };
    handleAuthSuccess(moderator);
  }, []);

  const logout = useCallback(() => {
    setCurrentModerator(null);
    localStorage.removeItem(MODERATOR_STORAGE_KEY);
    window.location.hash = '#/login';
  }, []);

  const value = {
    currentModerator,
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
