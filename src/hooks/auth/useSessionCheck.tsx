
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';

/**
 * Hook for authentication session check and redirects
 */
export function useSessionCheck(
  setUser,
  setSession,
  setProfileData,
  setLoading,
  requireAuth = true,
  redirectTo?: string
) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fonction pour vérifier l'état de la session
    const checkSession = async () => {
      setLoading(true);
      
      try {
        // Récupérer la session actuelle
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Mettre à jour l'état
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Si l'utilisateur est connecté, récupérer ses données de profil
        if (currentSession?.user) {
          // Utilisez setTimeout pour éviter les blocages potentiels
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id).then(data => {
              setProfileData(data);
            });
          }, 0);
        }
        
        // Gérer les redirections
        if (requireAuth && !currentSession) {
          // Stocker l'URL actuelle pour rediriger l'utilisateur après connexion
          const returnPath = location.pathname + location.search;
          navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
        } else if (currentSession && location.pathname === '/auth' && redirectTo) {
          // Rediriger depuis la page d'auth vers la destination spécifiée
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Vérifier la session immédiatement
    checkSession();
    
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData, setLoading]);
}
