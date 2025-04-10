
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { toast } from 'sonner';
import { checkAuthStatus } from '@/utils/authUtils';

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
      console.log("Checking session...");
      
      try {
        // Récupérer la session actuelle avec une méthode plus robuste
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          throw error;
        }
        
        const currentSession = data?.session;
        
        // Logger l'état de la session pour le débogage
        console.log("Session check result:", currentSession ? "Authenticated" : "Not authenticated");
        
        // Vérifier explicitement l'état d'authentification
        const authStatus = await checkAuthStatus();
        console.log("Auth status check complete:", authStatus);
        
        // Mettre à jour l'état
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Si l'utilisateur est connecté, récupérer ses données de profil
        if (currentSession?.user) {
          console.log("User is authenticated, fetching profile data");
          
          // Ne pas bloquer le processus d'authentification si la récupération du profil échoue
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id).then(data => {
              console.log("Profile data fetched:", data);
              setProfileData(data);
            }).catch(err => {
              console.error("Error fetching profile data:", err);
              // Continuer même si le profil ne peut pas être récupéré
            });
          }, 0);
        }
        
        // Gérer les redirections
        if (requireAuth && !currentSession) {
          console.log("Route requires auth but user is not authenticated, redirecting to auth page");
          const currentPath = location.pathname;
          const sanitizedPath = encodeURIComponent(currentPath);
          
          // Éviter les redirections vers des pages d'erreur ou non valides
          const validPath = sanitizedPath.length > 0 && !sanitizedPath.includes('error');
          const returnTo = validPath ? sanitizedPath : '';
          
          navigate(`/auth${returnTo ? `?returnTo=${returnTo}` : ''}`, { replace: true });
        } else if (currentSession && location.pathname === '/auth' && redirectTo) {
          // Rediriger depuis la page d'auth vers la destination spécifiée
          console.log("User is authenticated on auth page, redirecting to:", redirectTo);
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
