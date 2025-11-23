
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USER, MOCK_MERCHANT_USER } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginAsUser: () => void;
  loginAsMerchant: () => void;
  loginWithData: (user: User) => void; // New method for signup flow
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginAsUser = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(MOCK_USER);
      setIsLoading(false);
    }, 500);
  };

  const loginAsMerchant = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(MOCK_MERCHANT_USER);
      setIsLoading(false);
    }, 500);
  };

  // Used by Signup pages to log in the newly created user immediately
  const loginWithData = (newUser: User) => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(newUser);
      setIsLoading(false);
    }, 500);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAsUser, loginAsMerchant, loginWithData, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
