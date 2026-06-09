import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface AuthState {
  token: string | null;
  user: string | null;
  tenantId: string | null;
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
    tenantId: localStorage.getItem('tenantId'),
  });

  // Attach token interceptor to API client
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        if (authState.token) {
          config.headers.Authorization = `Bearer ${authState.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [authState.token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/token/', {
        username,
        password
      });

      const { access, tenant_id, username: returnedUser } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('user', returnedUser);
      if (tenant_id) {
        localStorage.setItem('tenantId', tenant_id);
      } else {
        localStorage.removeItem('tenantId');
      }

      setAuthState({
        token: access,
        user: returnedUser,
        tenantId: tenant_id || null,
      });
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');
    setAuthState({
      token: null,
      user: null,
      tenantId: null,
    });
  };

  const isAuthenticated = !!authState.token;

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, isAuthenticated }}>
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
