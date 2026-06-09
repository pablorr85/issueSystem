import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirect: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRedirect }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      onRedirect();
    }
  }, [isAuthenticated, onRedirect]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
