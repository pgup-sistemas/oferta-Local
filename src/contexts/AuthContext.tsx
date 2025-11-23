import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USER, MOCK_MERCHANT_USER } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginAsUser: () => void;
  loginAsMerchant: () => void;
  logout: () => void;
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

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAsUser, loginAsMerchant, logout }}>
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