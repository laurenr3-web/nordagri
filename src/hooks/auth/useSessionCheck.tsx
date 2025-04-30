
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
          console.error('Erreur lors de la vérification de la session:', error);
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
              if (data) {
                setProfileData(data);
              } else {
                console.log('Profil non trouvé, création en cours...');
                // Si le profil n'existe pas, on le crée
                createUserProfile(currentSession.user.id, currentSession.user.user_metadata)
                  .then(newProfile => {
                    if (newProfile) {
                      setProfileData(newProfile);
                    } else {
                      console.error("Erreur lors de la création du profil");
                    }
                  });
              }
            });
          }, 0);
        }
        
        // Gérer les redirections
        const returnPath = new URLSearchParams(location.search).get('returnTo') || '/dashboard';
        
        if (requireAuth && !currentSession) {
          // Stocker l'URL actuelle pour rediriger l'utilisateur après connexion
          const currentPath = location.pathname === '/auth' ? '/dashboard' : location.pathname + location.search;
          navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, { replace: true });
        } else if (currentSession && location.pathname === '/auth') {
          // Rediriger depuis la page d'auth vers la destination spécifiée
          navigate(returnPath, { replace: true });
        } else if (currentSession && location.pathname === '/') {
          // Rediriger depuis la racine vers le dashboard
          navigate('/dashboard', { replace: true });
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

// Function to create a user profile if it doesn't exist
async function createUserProfile(userId: string, userMetadata: any) {
  try {
    const firstName = userMetadata?.first_name || '';
    const lastName = userMetadata?.last_name || '';

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
}
