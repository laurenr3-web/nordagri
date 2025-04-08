
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { toast } from 'sonner';

/**
 * Hook pour vérification de session d'authentification et redirections
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

          // Configurer un rafraîchissement automatique du token
          const refreshToken = () => {
            supabase.auth.refreshSession().catch(refreshError => {
              console.error("Erreur lors du rafraîchissement du token:", refreshError);
            });
          };

          // Rafraîchir le token périodiquement (par exemple, toutes les 55 minutes pour un token d'1 heure)
          const refreshInterval = setInterval(refreshToken, 55 * 60 * 1000);
          return () => clearInterval(refreshInterval);
        }
        
        // Gérer les redirections
        if (requireAuth && !currentSession) {
          // Stocker l'URL actuelle pour rediriger l'utilisateur après connexion
          // Nettoyer et encoder correctement l'URL de retour pour éviter les caractères spéciaux
          const currentPath = location.pathname;
          const sanitizedPath = encodeURIComponent(currentPath);
          
          // Éviter les redirections vers des pages d'erreur ou non valides
          const validPath = sanitizedPath.length > 0 && !sanitizedPath.includes('error');
          const returnTo = validPath ? sanitizedPath : '';
          
          navigate(`/auth${returnTo ? `?returnTo=${returnTo}` : ''}`, { replace: true });
        } else if (currentSession && location.pathname === '/auth' && redirectTo) {
          // Rediriger depuis la page d'auth vers la destination spécifiée
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
        toast.error("Problème de connexion. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    // Vérifier la session immédiatement
    checkSession();
    
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData, setLoading]);
}
