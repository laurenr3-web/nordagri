
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Définition explicite du type des props
interface ProtectedLayoutProps {
  children: ReactNode;
}

// Utilisation correcte du type de props
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner message="Chargement..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
