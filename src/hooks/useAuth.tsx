
import { useAuth as useAuthCore } from '@/core/auth';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

/**
 * Hook d'authentification amélioré pour gérer l'état de l'utilisateur et les redirections
 * @param requireAuth Si true, redirige vers la page d'authentification si l'utilisateur n'est pas connecté
 * @param redirectTo Page de redirection après authentification (défaut: page actuelle)
 */
export function useAuth(requireAuth = true, redirectTo?: string) {
  const auth = useAuthCore(requireAuth, redirectTo);
  const navigate = useNavigate();
  
  // Vérification périodique de l'état du jeton
  useEffect(() => {
    if (!auth.session) return;
    
    // Vérifier que le jeton n'est pas sur le point d'expirer
    const checkTokenExpiration = () => {
      if (!auth.session) return;
      
      const expiryTime = new Date(auth.session.expires_at * 1000);
      const now = new Date();
      const timeToExpiry = expiryTime.getTime() - now.getTime();
      
      // Si le jeton expire dans moins de 5 minutes
      if (timeToExpiry < 5 * 60 * 1000) {
        console.log('Token expiring soon, refreshing session');
        refreshToken();
      }
    };
    
    // Fonction pour rafraîchir le jeton
    const refreshToken = async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Error refreshing token:', error);
          // Si l'erreur indique que le refresh token est invalide
          if (error.message.includes('refresh token')) {
            toast.error('Votre session a expiré', {
              description: 'Veuillez vous reconnecter',
              action: {
                label: 'Connexion',
                onClick: () => navigate('/auth')
              }
            });
          }
        } else {
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Exception during token refresh:', error);
      }
    };
    
    // Vérifier l'expiration au montage du composant
    checkTokenExpiration();
    
    // Configurer une vérification périodique toutes les 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [auth.session, navigate]);
  
  // Listener pour les erreurs de connectivité
  useEffect(() => {
    const handleOnline = () => {
      toast.success('Connexion rétablie', {
        description: 'Synchronisation des données en cours...'
      });
      
      // Tenter de rafraîchir la session si nécessaire
      if (auth.session) {
        supabase.auth.refreshSession();
      }
    };
    
    const handleOffline = () => {
      toast.warning('Connexion perdue', {
        description: 'Certaines fonctionnalités peuvent être limitées'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [auth.session]);
  
  return auth;
}
