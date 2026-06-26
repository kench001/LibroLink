import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../models/api';
import type { User } from '../models/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean; // Added separate startup state
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: 'teacher' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true); // Starts true for initial check
  const [isLoading, setIsLoading] = useState<boolean>(false); // Starts false for local operations
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true);
      const response = await apiClient.get<User>('/auth/me');
      setUser(response.data);
    } catch (err) {
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post<User>('/auth/login', { username, password });
      setUser(response.data);
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      setError(Array.isArray(serverMessage) ? serverMessage[0] : (serverMessage || 'Failed to login'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, role: 'teacher' | 'student', teacherCode?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post<User>('/auth/register', { username, password, role, teacherCode });
      setUser(response.data);
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      setError(Array.isArray(serverMessage) ? serverMessage[0] : (serverMessage || 'Failed to register'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiClient.post('/auth/logout');
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isCheckingAuth,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthViewModel = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthViewModel must be used within an AuthProvider');
  }
  return context;
};
