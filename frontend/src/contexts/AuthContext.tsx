import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginData, RegisterData } from '../types';
import { authApi, authStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getToken();
      const storedUser = authStorage.getStoredUser();

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          authStorage.setStoredUser(currentUser);
        } catch (error) {
          // Token is invalid, clear storage
          authStorage.clear();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    const response = await authApi.login(data);
    authStorage.setToken(response.access_token);
    authStorage.setStoredUser(response.user);
    setUser(response.user);
  };

  const register = async (data: RegisterData) => {
    const newUser = await authApi.register(data);
    // After registration, automatically log the user in
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};