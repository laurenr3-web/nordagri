
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTokenValidation } from './useTokenValidation';
import { useAuthErrorHandler } from './useAuthErrorHandler';
import { logger } from '@/utils/logger';
import { validateConnection, getSessionWithTimeout } from './utils/sessionValidation';
import { handleAuthRedirections } from './utils/redirectionUtils';
import { handleUserProfile } from './utils/profileUtils';

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
  const { validateAndCleanTokens, cleanCorruptedTokens } = useTokenValidation();
  const { handleAuthError, showUserFriendlyError } = useAuthErrorHandler();

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 1;
    
    const isMountedRef = () => isMounted;
    
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        // Valider et nettoyer les tokens
        const tokensValid = await validateAndCleanTokens();
        if (!tokensValid && isMounted) {
          logger.warn('Tokens invalidés, réinitialisation de la session');
          setSession(null);
          setUser(null);
          setProfileData(null);
          setLoading(false);
          
          if (requireAuth && location.pathname !== '/auth') {
            const returnPath = location.pathname === '/auth' ? '/dashboard' : location.pathname + location.search;
            navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
          }
          return;
        }
        
        // Vérifier la connexion à Supabase
        const isConnected = await validateConnection(location);
        if (!isConnected && isMounted) {
          setSession(null);
          setUser(null);
          setProfileData(null);
          setLoading(false);
          return;
        }
        
        // Récupérer la session
        const sessionResult = await getSessionWithTimeout();
        
        if (!isMounted) return;
        
        const { data: sessionData, error } = sessionResult;
        const currentSession = sessionData?.session;
        
        if (error) {
          const errorType = handleAuthError(error, 'session check');
          
          if (errorType === 'token_malformed' && retryCount === 0) {
            await cleanCorruptedTokens();
            if (isMounted) {
              setSession(null);
              setUser(null);
              setProfileData(null);
              showUserFriendlyError(errorType);
            }
          }
          
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        // Mettre à jour l'état
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
        }
        
        // Récupérer le profil si l'utilisateur est connecté
        if (currentSession?.user && isMounted) {
          await handleUserProfile(
            currentSession.user.id,
            currentSession.user.user_metadata,
            setProfileData,
            isMountedRef
          );
        }
        
        if (!isMounted) return;
        
        // Gestion des redirections
        handleAuthRedirections(
          navigate,
          location,
          currentSession,
          requireAuth,
          isMountedRef
        );
        
      } catch (error) {
        if (isMounted) {
          const errorType = handleAuthError(error, 'session check');
          
          if (errorType === 'token_malformed' && retryCount === 0) {
            await cleanCorruptedTokens();
            setSession(null);
            setUser(null);
            setProfileData(null);
          }
          
          setLoading(false);
          
          if (errorType !== 'token_malformed' && location.pathname !== '/auth' && retryCount < maxRetries) {
            retryCount++;
            logger.warn(`Retry session check (${retryCount}/${maxRetries})`);
            setTimeout(() => {
              if (isMounted) {
                checkSession();
              }
            }, 2000 * retryCount);
          } else {
            showUserFriendlyError(errorType, error);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
    };
    
  }, [navigate, location, requireAuth, redirectTo, setUser, setSession, setProfileData, setLoading]);
}
