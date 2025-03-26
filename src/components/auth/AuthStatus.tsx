
import React from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Composant qui affiche l'état d'authentification et les contrôles appropriés
 */
export const AuthStatus: React.FC = () => {
  const { user, loading, isAuthenticated, profileData, signOut } = useAuthContext();

  // Pendant le chargement de l'état d'authentification
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Vérification...</span>
      </div>
    );
  }

  // Si non authentifié, afficher un lien vers la page d'authentification
  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link to="/auth">Se connecter</Link>
      </Button>
    );
  }

  // Obtenir les initiales pour l'avatar
  const getInitials = () => {
    if (profileData?.first_name || profileData?.last_name) {
      const firstInitial = profileData.first_name ? profileData.first_name[0] : '';
      const lastInitial = profileData.last_name ? profileData.last_name[0] : '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  // Si authentifié, afficher les informations de l'utilisateur et un bouton de déconnexion
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm hidden md:block">
        <p className="font-medium">
          {profileData?.first_name 
            ? `${profileData.first_name} ${profileData.last_name || ''}`
            : user?.email}
        </p>
      </div>
      
      <Avatar className="h-8 w-8">
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      
      <Button variant="ghost" size="sm" onClick={signOut}>
        Déconnexion
      </Button>
    </div>
  );
};
