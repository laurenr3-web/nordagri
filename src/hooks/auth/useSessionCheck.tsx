
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { buildReturnPath, withPreviewToken } from '@/utils/previewRouting';

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

    let isActive = true;

    const hydrateProfile = async (userId: string, email?: string, userMetadata?: any) => {
      const profileData = await fetchUserProfile(userId, email ?? '');

      if (!isActive) return;

      if (profileData) {
        setProfileData(profileData);
        return;
      }

      console.log('Profil non trouvé, création en cours...');
      const newProfile = await createUserProfile(userId, userMetadata, email ?? '');

      if (isActive && newProfile) {
        setProfileData(newProfile);
      }
    };

    const checkSession = async () => {
      setLoading(true);
      
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la vérification de la session:', error);
          throw error;
        }

        if (!isActive) return;
        
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (!currentSession) {
          setProfileData(null);
        }
        
        const loc = locationRef.current;

        if (currentSession?.user) {
          void hydrateProfile(
            currentSession.user.id,
            currentSession.user.email,
            currentSession.user.user_metadata
          );
        }
        
        const isSpecialAuthPath = 
          loc.pathname === '/auth/callback' || 
          loc.pathname.startsWith('/confirm') || 
          (loc.pathname === '/auth' && 
           (loc.hash || 
            loc.search.includes('reset=true') || 
            loc.search.includes('verification=true')));
        
        if (isSpecialAuthPath) {
          console.log('Sur une page spéciale d\'authentification, pas de redirection automatique');
        } else if (requireAuth && !currentSession) {
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
        if (isActive) {
          setLoading(false);
        }
      }
    };
    
    checkSession();

    return () => {
      isActive = false;
    };
  }, []);
}

async function createUserProfile(userId: string, userMetadata: any, email = '') {
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
    
    return data
      ? {
          ...data,
          email,
        }
      : null;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
}
