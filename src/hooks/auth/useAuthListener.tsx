
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';

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

  useEffect(() => {
    // Configurer l'abonnement aux changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Mise à jour synchrone de l'état
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si l'utilisateur vient de se connecter, récupérer ses données de profil
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        // Utilisez setTimeout pour éviter les blocages potentiels
        setTimeout(() => {
          fetchUserProfile(session.user.id).then(data => {
            setProfileData(data);
          });
        }, 0);
        
        if (redirectTo && location.pathname === '/auth') {
          navigate(redirectTo, { replace: true });
        } 
      } else if (requireAuth && !session && event === 'SIGNED_OUT') {
        // L'utilisateur s'est déconnecté et cette route nécessite une authentification
        const returnPath = location.pathname + location.search;
        navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
      }
    });
    
    // Nettoyer l'abonnement lorsque le composant est démonté
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData]);
}
