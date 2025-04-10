
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile } from './useProfileData';
import { toast } from 'sonner';
import { checkAuthStatus } from '@/utils/authUtils';

/**
 * Hook to check authentication session and handle redirects
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
    // Function to check session state
    const checkSession = async () => {
      setLoading(true);
      console.log("Checking session...");
      
      try {
        // Get current session using a more robust method
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          throw error;
        }
        
        const currentSession = data?.session;
        
        // Log session state for debugging
        console.log("Session check result:", currentSession ? "Authenticated" : "Not authenticated");
        
        // Update state
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // If user is authenticated, get their profile data
        if (currentSession?.user) {
          console.log("User is authenticated, fetching profile data");
          
          try {
            const profileData = await fetchUserProfile(currentSession.user.id);
            console.log("Profile data fetched:", profileData);
            setProfileData(profileData);
          } catch (profileError) {
            console.error("Error fetching profile data:", profileError);
            // Continue even if profile cannot be fetched
          }
        }
        
        // Handle redirections
        if (requireAuth && !currentSession) {
          console.log("Route requires auth but user is not authenticated, redirecting to auth page");
          const currentPath = location.pathname;
          const sanitizedPath = encodeURIComponent(currentPath);
          
          // Avoid redirections to error or invalid pages
          const validPath = sanitizedPath.length > 0 && !sanitizedPath.includes('error');
          const returnTo = validPath ? sanitizedPath : '';
          
          // Don't redirect if already on auth page
          if (location.pathname !== '/auth') {
            navigate(`/auth${returnTo ? `?returnTo=${returnTo}` : ''}`, { replace: true });
          }
        } else if (currentSession && location.pathname === '/auth' && redirectTo) {
          // Redirect from auth page to specified destination
          console.log("User is authenticated on auth page, redirecting to:", redirectTo);
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error("Problème de connexion. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    // Check session immediately
    checkSession();
    
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData, setLoading]);
}
