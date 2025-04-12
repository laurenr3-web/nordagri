
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { ProfileData, AuthContextValue } from './types';
import { toast } from 'sonner';

/**
 * Hook for managing authentication state and redirects
 */
export function useAuth(requireAuth = true, redirectTo?: string): AuthContextValue {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as ProfileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      console.log(`Logout attempt: ${new Date().toISOString()}`);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Déconnexion réussie');
      // Redirection will be handled by the auth state listener
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Déconnexion échouée');
    }
  };

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      console.log("Checking session...");
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          throw error;
        }
        
        const currentSession = data?.session;
        console.log("Session check result:", currentSession ? "Authenticated" : "Not authenticated");
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          console.log("User is authenticated, fetching profile data");
          
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id).then(data => {
              console.log("Profile data fetched:", data);
              setProfileData(data);
            }).catch(err => {
              console.error("Error fetching profile data:", err);
            });
          }, 0);
        }
        
        // Handle redirections
        if (requireAuth && !currentSession) {
          console.log("Route requires auth but user is not authenticated, redirecting to auth page");
          const currentPath = location.pathname;
          const sanitizedPath = encodeURIComponent(currentPath);
          
          const validPath = sanitizedPath.length > 0 && !sanitizedPath.includes('error');
          const returnTo = validPath ? sanitizedPath : '';
          
          navigate(`/auth${returnTo ? `?returnTo=${returnTo}` : ''}`, { replace: true });
        } else if (currentSession && location.pathname === '/auth' && redirectTo) {
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
    
    checkSession();
  }, [navigate, location, requireAuth, redirectTo]);

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth listener");
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`, session?.user?.id || 'No user');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        setTimeout(() => {
          if (session && session.user) {
            fetchUserProfile(session.user.id).then(data => {
              console.log("Fetched profile data:", data);
              setProfileData(data);
            }).catch(error => {
              console.error("Error fetching profile:", error);
            });
          }
        }, 0);
        
        if (redirectTo && location.pathname === '/auth') {
          navigate(redirectTo, { replace: true });
        } 
      } else if (requireAuth && !session && event === 'SIGNED_OUT') {
        console.log("User signed out and route requires auth, redirecting to auth page");
        const returnPath = location.pathname + location.search;
        navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
      }
    });
    
    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, requireAuth, redirectTo]);

  return {
    user,
    session,
    loading,
    profileData,
    isAuthenticated: !!user,
    signOut,
  };
}
