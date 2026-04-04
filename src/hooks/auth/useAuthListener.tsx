
import { useEffect } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { toast } from 'sonner';
import { buildReturnPath, withPreviewToken } from '@/utils/previewRouting';

/**
 * Hook to listen for authentication state changes
 */
export function useAuthListener(
  setUser,
  setSession,
  setProfileData,
  setLoading,
  requireAuth = true,
  redirectTo?: string
) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef<Location>(location);
  locationRef.current = location;

  useEffect(() => {
    console.log('Setting up auth listener');
    
    // Configurer l'abonnement aux changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        setTimeout(() => {
          fetchUserProfile(session.user.id).then(data => {
            if (data) {
              setProfileData(data);
              if (event === 'SIGNED_IN') {
                toast.success(`Bienvenue ${data.first_name || ''}!`);
              }
            }
          });
        }, 0);
        
        const loc = locationRef.current;
        const isSpecialAuthPath = 
          loc.pathname === '/auth/callback' || 
          loc.pathname.startsWith('/confirm') || 
          (loc.pathname === '/auth' && 
           (loc.hash || 
            loc.search.includes('reset=true') || 
            loc.search.includes('verification=true')));
        
        if (loc.pathname === '/auth' && !isSpecialAuthPath) {
          const params = new URLSearchParams(loc.search);
          const returnPath = params.get('returnTo') || redirectTo || '/dashboard';
          navigate(withPreviewToken(returnPath, loc.search), { replace: true });
        } 
      } else if (requireAuth && !session && event === 'SIGNED_OUT') {
        const loc = locationRef.current;
        const returnPath = loc.pathname === '/auth'
          ? '/dashboard'
          : buildReturnPath(loc.pathname, loc.search, loc.hash);
        navigate(withPreviewToken(`/auth?returnTo=${encodeURIComponent(returnPath)}`, loc.search), { replace: true });
      }
    });
    
    // Nettoyer l'abonnement lorsque le composant est démonté
    return () => {
      console.log('Cleaning up auth listener');
      authListener.subscription.unsubscribe();
    };
  }, []); // Run once — location accessed via ref
}
