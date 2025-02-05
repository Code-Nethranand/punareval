import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token, restoreState } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Try to restore auth state if not authenticated
    if (!isAuthenticated || !token) {
      restoreState();
    }
  }, [isAuthenticated, token, restoreState]);

  if (!isAuthenticated || !token) {
    // Save the attempted URL
    localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
