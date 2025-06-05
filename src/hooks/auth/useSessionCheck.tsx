
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
    const maxRetries = 2; // Réduire les tentatives pour éviter les boucles
    
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        // Valider et nettoyer les tokens avant toute opération
        const tokensValid = await validateAndCleanTokens();
        if (!tokensValid && isMounted) {
          logger.warn('Tokens invalidés, réinitialisation de la session');
          setSession(null);
          setUser(null);
          setProfileData(null);
          setLoading(false);
          
          // Si on est sur une page protégée, rediriger vers auth
          if (requireAuth && location.pathname !== '/auth') {
            const returnPath = location.pathname === '/auth' ? '/dashboard' : location.pathname + location.search;
            navigate(`/auth?returnTo=${encodeURIComponent(returnPath)}`, { replace: true });
          }
          return;
        }
        
        // Vérifier la connexion à Supabase avec timeout réduit
        const connectionPromise = checkSupabaseConnection();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de connexion')), 5000)
        );
        
        const isConnected = await Promise.race([connectionPromise, timeoutPromise]) as boolean;
        
        if (!isConnected && isMounted) {
          logger.error('Connexion à Supabase impossible');
          if (location.pathname !== '/auth') {
            toast.error('Service temporairement indisponible', {
              description: 'Tentative de reconnexion...',
              duration: 3000
            });
          }
          
          setSession(null);
          setUser(null);
          setProfileData(null);
          setLoading(false);
          return;
        }
        
        // Récupérer la session avec retry et timeout réduit
        const getSessionWithRetry = async (): Promise<any> => {
          for (let i = 0; i <= maxRetries; i++) {
            try {
              const sessionPromise = supabase.auth.getSession();
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout dépassé')), 5000)
              );
              
              return await Promise.race([sessionPromise, timeoutPromise]);
            } catch (error) {
              logger.warn(`Tentative ${i + 1}/${maxRetries + 1} échouée:`, error);
              
              // Si c'est une erreur de token malformé, nettoyer immédiatement
              const errorType = handleAuthError(error, 'session retry');
              if (errorType === 'token_malformed') {
                await cleanCorruptedTokens();
                throw new Error('Token malformé, nettoyage effectué');
              }
              
              if (i === maxRetries) {
                throw error;
              }
              
              // Attendre avant de réessayer
              await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
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
              // Forcer un rechargement après nettoyage
              setTimeout(() => {
                if (isMounted) {
                  window.location.reload();
                }
              }, 1000);
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
            // Recharger la page après nettoyage
            setTimeout(() => {
              if (isMounted) {
                window.location.reload();
              }
            }, 500);
          }
          
          setLoading(false);
          
          // Ne pas faire de retry en cas d'erreur de token malformé
          if (errorType !== 'token_malformed' && location.pathname !== '/auth' && retryCount < maxRetries) {
            retryCount++;
            logger.warn(`Retry session check (${retryCount}/${maxRetries})`);
            setTimeout(() => {
              if (isMounted) {
                checkSession();
              }
            }, 1000 * retryCount);
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
