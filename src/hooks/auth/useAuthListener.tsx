
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
    
    // Subscribe to authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`, session?.user?.id || 'No user');
      
      // Synchronous state update
      setSession(session);
      setUser(session?.user ?? null);
      
      // If user just logged in, get their profile data
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        // Use setTimeout to avoid potential blocking
        setTimeout(() => {
          if (session && session.user) {  // Additional check
            fetchUserProfile(session.user.id).then(data => {
              console.log("Fetched profile data:", data);
              setProfileData(data);
            }).catch(error => {
              console.error("Error fetching profile:", error);
              // Don't block authentication if profile cannot be retrieved
            });
          }
        }, 0);
        
        if (redirectTo && location.pathname === '/auth') {
          navigate(redirectTo, { replace: true });
        } 
      } else if (event === 'SIGNED_OUT') {
        // Clear profile data on sign out
        setProfileData(null);
        
        if (requireAuth) {
          // User signed out and route requires authentication
          console.log("User signed out and route requires auth, redirecting to auth page");
          navigate(`/auth`, { replace: true });
        }
      }
    });
    
    // Clean up subscription when component unmounts
    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData]);
}
