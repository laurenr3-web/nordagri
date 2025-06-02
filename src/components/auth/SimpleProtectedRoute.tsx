
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { Loader2 } from 'lucide-react';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
}

export const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSimpleAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnPath = location.pathname + location.search;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnPath)}`} replace />;
  }

  return <>{children}</>;
};
