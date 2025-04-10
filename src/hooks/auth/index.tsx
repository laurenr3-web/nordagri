
import { useAuthState, AuthStateReturn } from './useAuthState';
import { useAuthHandlers } from './useAuthHandlers';
import { useSessionCheck } from './useSessionCheck';
import { useAuthListener } from './useAuthListener';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

/**
 * Interface for the auth hook return value
 */
export interface AuthReturn {
  user: AuthStateReturn['user'];
  session: AuthStateReturn['session'];
  loading: AuthStateReturn['loading'];
  profileData: AuthStateReturn['profileData'];
  isAuthenticated: AuthStateReturn['isAuthenticated'];
  signOut: () => Promise<void>;
}

/**
 * Authentication hook to manage user state and redirections
 * @param requireAuth If true, redirect to authentication page if user is not logged in
 * @param redirectTo Redirection page after authentication (default: current page)
 */
export function useAuth(requireAuth = true, redirectTo?: string): AuthReturn {
  // Manage authentication state
  const { 
    user, setUser,
    session, setSession,
    loading, setLoading,
    profileData, setProfileData,
    isAuthenticated
  } = useAuthState();

  // Authentication handlers
  const { signOut } = useAuthHandlers();

  // Check session on mount
  useSessionCheck(
    setUser,
    setSession,
    setProfileData,
    setLoading,
    requireAuth,
    redirectTo
  );

  // Listen for auth state changes
  useAuthListener(
    setUser,
    setSession,
    setProfileData,
    requireAuth,
    redirectTo
  );

  return {
    user,
    session,
    loading,
    profileData,
    isAuthenticated,
    signOut,
  };
}
