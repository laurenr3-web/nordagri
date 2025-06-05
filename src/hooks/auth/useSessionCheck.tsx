
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { fetchUserProfile, createUserProfile } from './useProfileData';
import { useTokenValidation } from './useTokenValidation';
import { useAuthErrorHandler } from './useAuthErrorHandler';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

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
    const maxRetries = 3;
    
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        // Valider les tokens avant de continuer
        const tokensValid = await validateAndCleanTokens();
        if (!tokensValid && isMounted) {
          logger.warn('Tokens invalidés, réinitialisation de la session');
          setSession(null);
          setUser(null);
          setProfileData(null);
          setLoading(false);
          return;
        }
        
        // Vérifier la connexion à Supabase avec timeout
        const connectionPromise = checkSupabaseConnection();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de connexion')), 10000)
        );
        
        const isConnected = await Promise.race([connectionPromise, timeoutPromise]) as boolean;
        
        if (!isConnected && isMounted) {
          logger.error('Connexion à Supabase impossible');
          if (location.pathname !== '/auth') {
            toast.error('Problème de connexion au serveur', {
              description: 'Tentative de reconnexion en cours...',
              duration: 5000
            });
          }
          
          setSession(null);
          setUser(null);
          setProfileData(null);
          setLoading(false);
          return;
        }
        
        // Récupérer la session avec retry et timeout
        const getSessionWithRetry = async (): Promise<any> => {
          for (let i = 0; i <= maxRetries; i++) {
            try {
              const sessionPromise = supabase.auth.getSession();
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout dépassé')), 8000)
              );
              
              return await Promise.race([sessionPromise, timeoutPromise]);
            } catch (error) {
              logger.warn(`Tentative ${i + 1}/${maxRetries + 1} échouée:`, error);
              
              if (i === maxRetries) {
                throw error;
              }
              
              // Attendre avant de réessayer
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
          }
        };
        
        const sessionResult = await getSessionWithRetry();
        
        if (!isMounted) return;
        
        const { data: sessionData, error } = sessionResult;
        const currentSession = sessionData?.session;
        
        if (error) {
          const errorType = handleAuthError(error, 'session check');
          
          if (errorType === 'token_malformed') {
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
          try {
            const profileData = await fetchUserProfile(currentSession.user.id);
            if (isMounted) {
              if (profileData) {
                setProfileData(profileData);
              } else {
                logger.log('Profil non trouvé, création en cours...');
                const newProfile = await createUserProfile(currentSession.user.id, currentSession.user.user_metadata);
                if (newProfile && isMounted) {
                  setProfileData(newProfile);
                }
              }
            }
          } catch (profileError) {
            logger.error("Erreur lors du chargement du profil:", profileError);
          }
        }
        
        if (!isMounted) return;
        
        // Gestion des redirections
        const isSpecialAuthPath = 
          location.pathname === '/auth/callback' || 
          location.pathname.startsWith('/confirm') || 
          (location.pathname === '/auth' && 
           (location.hash || 
            location.search.includes('reset=true') || 
            location.search.includes('verification=true')));
        
        if (isSpecialAuthPath) {
          logger.log('Sur une page spéciale d\'authentification, pas de redirection automatique');
        } 
        else if (requireAuth && !currentSession) {
          const currentPath = location.pathname === '/auth' ? '/dashboard' : location.pathname + location.search;
          navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, { replace: true });
        } else if (currentSession && location.pathname === '/auth' && !location.hash && !location.search.includes('reset=true')) {
          const returnPath = new URLSearchParams(location.search).get('returnTo') || '/dashboard';
          navigate(returnPath, { replace: true });
        } else if (currentSession && location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
        
      } catch (error) {
        if (isMounted) {
          const errorType = handleAuthError(error, 'session check');
          
          if (errorType === 'token_malformed') {
            await cleanCorruptedTokens();
            setSession(null);
            setUser(null);
            setProfileData(null);
          }
          
          setLoading(false);
          
          if (location.pathname !== '/auth' && retryCount < maxRetries) {
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
