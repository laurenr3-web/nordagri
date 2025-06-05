
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
    const maxRetries = 1; // Réduire encore plus les tentatives
    
    const checkSession = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        // Valider et nettoyer les tokens avec une approche moins agressive
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
        
        // Vérifier la connexion à Supabase avec timeout plus court
        const connectionPromise = checkSupabaseConnection();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de connexion')), 3000)
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
        
        // Récupérer la session avec un seul essai et timeout réduit
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout dépassé')), 3000)
        );
        
        const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;
        
        const { data: sessionData, error } = sessionResult;
        const currentSession = sessionData?.session;
        
        if (error) {
          const errorType = handleAuthError(error, 'session check');
          
          // Être moins agressif avec le nettoyage des tokens
          if (errorType === 'token_malformed' && retryCount === 0) {
            await cleanCorruptedTokens();
            if (isMounted) {
              setSession(null);
              setUser(null);
              setProfileData(null);
              showUserFriendlyError(errorType);
              // Pas de rechargement automatique, laisser l'utilisateur retry
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
        
        // Gestion des redirections - plus conservative
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
          // Ajouter un délai avant redirection pour éviter les redirections prématurées
          setTimeout(() => {
            if (isMounted && !currentSession) {
              const currentPath = location.pathname === '/auth' ? '/dashboard' : location.pathname + location.search;
              navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, { replace: true });
            }
          }, 300);
        } else if (currentSession && location.pathname === '/auth' && !location.hash && !location.search.includes('reset=true')) {
          const returnPath = new URLSearchParams(location.search).get('returnTo') || '/dashboard';
          // Ajouter un délai pour s'assurer que l'état d'auth est stable
          setTimeout(() => {
            if (isMounted) {
              navigate(returnPath, { replace: true });
            }
          }, 200);
        } else if (currentSession && location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
        
      } catch (error) {
        if (isMounted) {
          const errorType = handleAuthError(error, 'session check');
          
          // Être plus conservateur avec le nettoyage automatique
          if (errorType === 'token_malformed' && retryCount === 0) {
            await cleanCorruptedTokens();
            setSession(null);
            setUser(null);
            setProfileData(null);
            // Pas de rechargement automatique
          }
          
          setLoading(false);
          
          // Réduire les retry automatiques
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
