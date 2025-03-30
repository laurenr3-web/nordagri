
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
    // Set up auth state change subscription
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Synchronous state updates
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle authentication events
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        // Use setTimeout to avoid potential auth deadlocks
        setTimeout(() => {
          fetchUserProfile(session.user.id).then(data => {
            if (data) {
              setProfileData(data);
            } else {
              toast.error("Erreur de profil", {
                description: "Impossible de charger vos données de profil",
              });
            }
          }).catch(error => {
            console.error('Profile fetch error:', error);
            toast.error("Erreur de profil", {
              description: "Une erreur est survenue lors du chargement du profil",
            });
          });
        }, 0);
        
        // Handle redirect after authentication if needed
        if (redirectTo && location.pathname === '/auth') {
          navigate(redirectTo, { replace: true });
        } 
      } else if (event === 'SIGNED_OUT') {
        // Clear profile data on sign out
        setProfileData(null);
        
        // Redirect to auth page if authentication is required
        if (requireAuth) {
          const returnPath = location.pathname + location.search;
          navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
        }
      }
    });
    
    // Clean up subscription when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData]);
}
