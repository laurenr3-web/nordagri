
import React, { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';

interface ProtectedLayoutProps {
  redirectTo?: string;
  children?: ReactNode;
}

/**
 * Layout component that protects routes from unauthorized access
 */
const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ redirectTo = '/auth', children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    // Show loading state while checking authentication
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to={redirectTo} />;
  }

  // Render children or outlet (for nested routes)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedLayout;
