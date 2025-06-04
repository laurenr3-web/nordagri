
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { toast } from 'sonner';

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
    // Variable pour suivre si le composant est monté
    let isMounted = true;
    
    // Fonction pour vérifier l'état de la session
    const checkSession = async () => {
      if (!isMounted) return;
      setLoading(true);
      
      try {
        // Vérifier d'abord la connexion à Supabase
        const isConnected = await checkSupabaseConnection();
        
        if (!isConnected && isMounted) {
          console.error('Connexion à Supabase impossible');
          if (location.pathname !== '/auth') {
            toast.error('Problème de connexion au serveur', {
              description: 'Tentative de reconnexion en cours...',
              duration: 5000
            });
          }
          
          // On définit une valeur de session et d'utilisateur null
          // mais on ne redirige pas, pour permettre au site de fonctionner en mode hors ligne
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Récupérer la session actuelle avec un timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout dépassé')), 10000)
        );
        
        const sessionResult = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        if (!isMounted) return;
        
        // Handle the session result properly
        const { data: sessionData, error } = sessionResult as { data: { session: any }, error: any };
        const currentSession = sessionData?.session;
        
        if (error) {
          console.error('Erreur lors de la vérification de la session:', error);
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Mettre à jour l'état
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Si l'utilisateur est connecté, récupérer ses données de profil
        if (currentSession?.user) {
          try {
            const profileData = await fetchUserProfile(currentSession.user.id);
            if (isMounted) {
              if (profileData) {
                setProfileData(profileData);
              } else {
                console.log('Profil non trouvé, création en cours...');
                // Si le profil n'existe pas, on le crée
                const newProfile = await createUserProfile(currentSession.user.id, currentSession.user.user_metadata);
                if (newProfile && isMounted) {
                  setProfileData(newProfile);
                } else if (isMounted) {
                  console.error("Erreur lors de la création du profil");
                }
              }
            }
          } catch (profileError) {
            console.error("Erreur lors du chargement du profil:", profileError);
          }
        }
        
        if (!isMounted) return;
        
        // Ne pas rediriger si nous sommes sur une page spéciale d'authentification
        const isSpecialAuthPath = 
          location.pathname === '/auth/callback' || 
          location.pathname.startsWith('/confirm') || 
          (location.pathname === '/auth' && 
           (location.hash || 
            location.search.includes('reset=true') || 
            location.search.includes('verification=true')));
        
        if (isSpecialAuthPath) {
          console.log('Sur une page spéciale d\'authentification, pas de redirection automatique');
        } 
        // Gérer les redirections uniquement si nous ne sommes pas sur une page spéciale
        else if (requireAuth && !currentSession) {
          // Stocker l'URL actuelle pour rediriger l'utilisateur après connexion
          const currentPath = location.pathname === '/auth' ? '/dashboard' : location.pathname + location.search;
          navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, { replace: true });
        } else if (currentSession && location.pathname === '/auth' && !location.hash && !location.search.includes('reset=true')) {
          // Rediriger depuis la page d'auth vers la destination spécifiée
          // Seulement si nous ne sommes pas sur une confirmation d'email ou réinitialisation
          const returnPath = new URLSearchParams(location.search).get('returnTo') || '/dashboard';
          navigate(returnPath, { replace: true });
        } else if (currentSession && location.pathname === '/') {
          // Rediriger depuis la racine vers le dashboard
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Erreur lors de la vérification de la session:', error);
          setLoading(false);
          
          if (location.pathname !== '/auth') {
            toast.error('Problème de connexion au serveur', {
              description: 'Veuillez rafraîchir la page ou réessayer plus tard',
              duration: 8000
            });
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Vérifier la session immédiatement
    checkSession();
    
    // Nettoyer
    return () => {
      isMounted = false;
    };
    
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
