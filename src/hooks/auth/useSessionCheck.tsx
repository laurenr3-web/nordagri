
import { useEffect } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { buildReturnPath, withPreviewToken } from '@/utils/previewRouting';
import { useRef } from 'react';

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
  const hasChecked = useRef(false);
  const locationRef = useRef<Location>(location);
  locationRef.current = location;

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

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
        
        const loc = locationRef.current;
        // Si l'utilisateur est connecté, récupérer ses données de profil
        if (currentSession?.user) {
          const profileData = await fetchUserProfile(currentSession.user.id);
          if (profileData) {
            setProfileData(profileData);
          } else {
            console.log('Profil non trouvé, création en cours...');
            const newProfile = await createUserProfile(currentSession.user.id, currentSession.user.user_metadata);
            if (newProfile) {
              setProfileData(newProfile);
            }
          }
        }
        
        // Ne pas rediriger si nous sommes sur une page spéciale d'authentification
        const isSpecialAuthPath = 
          loc.pathname === '/auth/callback' || 
          loc.pathname.startsWith('/confirm') || 
          (loc.pathname === '/auth' && 
           (loc.hash || 
            loc.search.includes('reset=true') || 
            loc.search.includes('verification=true')));
        
        if (isSpecialAuthPath) {
          console.log('Sur une page spéciale d\'authentification, pas de redirection automatique');
        } 
        // Gérer les redirections uniquement si nous ne sommes pas sur une page spéciale
        else if (requireAuth && !currentSession) {
          const currentPath = loc.pathname === '/auth'
            ? '/dashboard'
            : buildReturnPath(loc.pathname, loc.search, loc.hash);
          navigate(withPreviewToken(`/auth?returnTo=${encodeURIComponent(currentPath)}`, loc.search), { replace: true });
        } else if (currentSession && loc.pathname === '/auth' && !loc.hash && !loc.search.includes('reset=true')) {
          const returnPath = new URLSearchParams(loc.search).get('returnTo') || '/dashboard';
          navigate(withPreviewToken(returnPath, loc.search), { replace: true });
        } else if (currentSession && loc.pathname === '/') {
          navigate(withPreviewToken('/dashboard', loc.search), { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Vérifier la session immédiatement
    checkSession();
    
  }, []); // Run once on mount only
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
