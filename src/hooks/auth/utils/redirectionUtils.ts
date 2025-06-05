
import { NavigateFunction, Location } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * Utility functions for handling authentication redirections
 */
export const isSpecialAuthPath = (location: Location): boolean => {
  return location.pathname === '/auth/callback' || 
         location.pathname.startsWith('/confirm') || 
         (location.pathname === '/auth' && 
          (!!location.hash || 
           location.search.includes('reset=true') || 
           location.search.includes('verification=true')));
};

export const handleAuthRedirections = (
  navigate: NavigateFunction,
  location: Location,
  currentSession: any,
  requireAuth: boolean,
  isMounted: () => boolean
) => {
  if (isSpecialAuthPath(location)) {
    logger.log('Sur une page spéciale d\'authentification, pas de redirection automatique');
    return;
  }
  
  if (requireAuth && !currentSession) {
    // Redirection vers auth pour les pages protégées
    setTimeout(() => {
      if (isMounted()) {
        const currentPath = location.pathname === '/auth' ? '/dashboard' : location.pathname + location.search;
        navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, { replace: true });
      }
    }, 500);
  } else if (currentSession && location.pathname === '/auth' && !location.hash && !location.search.includes('reset=true')) {
    // Redirection après connexion réussie
    const returnPath = new URLSearchParams(location.search).get('returnTo') ?? '/dashboard';
    setTimeout(() => {
      if (isMounted()) {
        navigate(returnPath, { replace: true });
      }
    }, 300);
  } else if (currentSession && location.pathname === '/') {
    // Redirection depuis la page d'accueil
    navigate('/dashboard', { replace: true });
  }
};
