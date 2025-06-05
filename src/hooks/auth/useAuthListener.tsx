
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { useAuthErrorHandler } from './useAuthErrorHandler';
import { useTokenValidation } from './useTokenValidation';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

/**
 * Hook to listen for authentication state changes
 */
export function useAuthListener(
  setUser,
  setSession,
  setProfileData,
  requireAuth = true,
  redirectTo?: string
) {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthError, showUserFriendlyError } = useAuthErrorHandler();
  const { cleanCorruptedTokens } = useTokenValidation();

  useEffect(() => {
    logger.log('Configuration du listener d\'authentification');
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log(`Changement d'état d'authentification: ${event}`, session?.user?.id ? 'Utilisateur connecté' : 'Aucun utilisateur');
      
      try {
        // Mise à jour synchrone de l'état
        setSession(session);
        setUser(session?.user ?? null);
        
        // Gestion des événements spécifiques
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Récupération du profil avec délai pour éviter les blocages
          setTimeout(async () => {
            try {
              const data = await fetchUserProfile(session.user.id);
              if (data) {
                setProfileData(data);
                if (event === 'SIGNED_IN') {
                  toast.success(`Bienvenue ${data.first_name || ''}!`);
                }
              }
            } catch (error) {
              const errorType = handleAuthError(error, 'profile fetch');
              if (errorType === 'token_malformed') {
                await cleanCorruptedTokens();
                setTimeout(() => window.location.reload(), 500);
              }
              logger.error('Erreur lors du chargement du profil:', error);
            }
          }, 100);
          
          // Gestion des redirections pour SIGNED_IN seulement
          if (event === 'SIGNED_IN') {
            const isSpecialAuthPath = 
              location.pathname === '/auth/callback' || 
              location.pathname.startsWith('/confirm') || 
              (location.pathname === '/auth' && 
               (location.hash || 
                location.search.includes('reset=true') || 
                location.search.includes('verification=true')));
            
            if (location.pathname === '/auth' && !isSpecialAuthPath) {
              const params = new URLSearchParams(location.search);
              const returnPath = params.get('returnTo') || redirectTo || '/dashboard';
              logger.log(`Redirection après ${event} vers ${returnPath}`);
              navigate(returnPath, { replace: true });
            }
          }
        } else if (requireAuth && !session && event === 'SIGNED_OUT') {
          // Nettoyage du profil lors de la déconnexion
          setProfileData(null);
          
          logger.log('Utilisateur déconnecté, redirection vers la page d\'authentification');
          const returnPath = location.pathname === '/auth' ? '/dashboard' : location.pathname + location.search;
          navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
        }
        
      } catch (error) {
        const errorType = handleAuthError(error, 'auth state change');
        logger.error('Erreur dans le listener d\'authentification:', error);
        
        if (errorType === 'token_malformed') {
          await cleanCorruptedTokens();
          setTimeout(() => window.location.reload(), 500);
        } else {
          showUserFriendlyError(errorType, error);
        }
      }
    });
    
    return () => {
      logger.log('Nettoyage du listener d\'authentification');
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData]);
}
