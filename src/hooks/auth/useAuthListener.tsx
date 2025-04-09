
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { toast } from 'sonner';

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
    console.log("Setting up auth listener");
    
    // Configurer l'abonnement aux changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`, session?.user?.id || 'No user');
      
      // Mise à jour synchrone de l'état
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si l'utilisateur vient de se connecter, récupérer ses données de profil
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        // Utilisez setTimeout pour éviter les blocages potentiels
        setTimeout(() => {
          fetchUserProfile(session.user.id).then(data => {
            console.log("Fetched profile data:", data);
            setProfileData(data);
          }).catch(error => {
            console.error("Error fetching profile:", error);
            toast.error("Impossible de récupérer les données du profil");
          });
        }, 0);
        
        if (redirectTo && location.pathname === '/auth') {
          navigate(redirectTo, { replace: true });
        } 
      } else if (requireAuth && !session && event === 'SIGNED_OUT') {
        // L'utilisateur s'est déconnecté et cette route nécessite une authentification
        console.log("User signed out and route requires auth, redirecting to auth page");
        const returnPath = location.pathname + location.search;
        navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
      }
    });
    
    // Nettoyer l'abonnement lorsque le composant est démonté
    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData]);
}
