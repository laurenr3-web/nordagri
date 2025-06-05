
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Composant qui protège une route en vérifiant l'authentification
 * Redirige vers la page d'authentification si l'utilisateur n'est pas connecté
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Logging pour debug
  useEffect(() => {
    console.log(`ProtectedRoute - isAuthenticated: ${isAuthenticated}, loading: ${loading}, path: ${location.pathname}`);
  }, [isAuthenticated, loading, location.pathname]);

  // Ajouter un délai avant de rediriger pour éviter les redirections prématurées
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 200); // Délai de 200ms pour permettre à l'auth de se stabiliser
      
      return () => clearTimeout(timer);
    } else {
      setShouldRedirect(false);
    }
  }, [loading, isAuthenticated]);

  // Afficher un indicateur de chargement pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Vérification de l'authentification...</p>
      </div>
    );
  }

  // Rediriger vers la page d'authentification si non authentifié
  if (!isAuthenticated && shouldRedirect) {
    const returnPath = location.pathname + location.search;
    console.log(`Redirection vers /auth - utilisateur non authentifié, returnPath: ${returnPath}`);
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnPath)}`} replace />;
  }

  // Rendre les enfants si authentifié
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Pendant le délai d'attente, afficher un loader
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg">Vérification de l'authentification...</p>
    </div>
  );
};
