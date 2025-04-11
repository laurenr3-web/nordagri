
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Définir des types pour une meilleure maintenabilité
type PreloadFunction = () => Promise<any>;
type RoutePreloadMap = Record<string, PreloadFunction[]>;

// Map des routes et leurs préchargements associés - étendu pour plus de contexte
const routePreloadMap: RoutePreloadMap = {
  '/': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Dashboard'),
    () => import('@/pages/Home'),
  ],
  '/home': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Dashboard'),
    () => import('@/pages/Settings'),
  ],
  '/equipment': [
    () => import('@/pages/EquipmentDetail'),
    () => import('@/pages/Maintenance'),
    () => import('@/pages/Parts'),
  ],
  '/maintenance': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Parts'),
    () => import('@/pages/Interventions'),
  ],
  '/dashboard': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Maintenance'),
    () => import('@/pages/Parts'),
    () => import('@/pages/Profile'),
  ],
  '/parts': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Maintenance'),
  ],
  '/interventions': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Maintenance'),
  ],
  '/settings': [
    () => import('@/pages/Profile'),
  ],
  '/profile': [
    () => import('@/pages/Settings'),
  ],
};

/**
 * Hook amélioré pour précharger intelligemment les pages
 * en fonction de la route actuelle et du comportement utilisateur
 */
export const useRoutePreloading = () => {
  const { pathname } = useLocation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mémoriser la fonction de préchargement pour éviter des recréations inutiles
  const preloadRoutes = useCallback((routes: PreloadFunction[] | undefined) => {
    if (!routes) return;
    
    console.log(`Préchargement des routes associées à ${pathname}`);
    
    // Utiliser Promise.all pour paralléliser les préchargements mais capturer les erreurs individuellement
    Promise.allSettled(routes.map(importFn => 
      importFn().catch(err => {
        console.error(`Erreur lors du préchargement d'une route: ${err.message}`);
      })
    )).then(results => {
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        console.log(`Préchargement terminé: ${successCount} routes préchargées${failCount ? `, ${failCount} échecs` : ''}`);
      }
    });
  }, [pathname]);
  
  useEffect(() => {
    // Nettoyer le timer précédent si existant
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Attendre que la page actuelle soit bien chargée avant de précharger d'autres pages
    timerRef.current = setTimeout(() => {
      const routesToPreload = routePreloadMap[pathname];
      preloadRoutes(routesToPreload);
    }, 1000); // Délai d'une seconde après la navigation
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname, preloadRoutes]);
};
