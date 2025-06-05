
import { useAuthState, AuthStateReturn } from './useAuthState';
import { useAuthHandlers } from './useAuthHandlers';
import { useSessionCheck } from './useSessionCheck';
import { useAuthListener } from './useAuthListener';
import { useAuthErrorHandler } from './useAuthErrorHandler';

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
 * Hook d'authentification pour gérer l'état de l'utilisateur et les redirections
 * @param requireAuth Si true, redirige vers la page d'authentification si l'utilisateur n'est pas connecté
 * @param redirectTo Page de redirection après authentification (défaut: page actuelle)
 */
export function useAuth(requireAuth = true, redirectTo?: string): AuthReturn {
  const { handleAuthError } = useAuthErrorHandler();
  
  // Manage authentication state
  const { 
    user, setUser,
    session, setSession,
    loading, setLoading,
    profileData, setProfileData,
    isAuthenticated
  } = useAuthState();

  // Authentication handlers with error handling
  const { signOut } = useAuthHandlers();

  // Check session on mount with improved error handling
  useSessionCheck(
    setUser,
    setSession,
    setProfileData,
    setLoading,
    requireAuth,
    redirectTo
  );

  // Listen for auth state changes with improved error handling
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
