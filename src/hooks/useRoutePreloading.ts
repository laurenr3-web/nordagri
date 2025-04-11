
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Map des routes et leurs préchargements associés
const routePreloadMap = {
  '/': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Dashboard'),
  ],
  '/equipment': [
    () => import('@/pages/EquipmentDetail'),
    () => import('@/pages/Maintenance'),
  ],
  '/maintenance': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Parts'),
  ],
  '/dashboard': [
    () => import('@/pages/Equipment'),
    () => import('@/pages/Maintenance'),
    () => import('@/pages/Parts'),
  ],
};

/**
 * Hook pour précharger intelligemment les pages en fonction de la route actuelle
 */
export const useRoutePreloading = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Attendre que la page actuelle soit bien chargée avant de précharger d'autres pages
    const timer = setTimeout(() => {
      const routesToPreload = routePreloadMap[pathname];
      
      if (routesToPreload) {
        console.log(`Préchargement des routes associées à ${pathname}`);
        routesToPreload.forEach(importFn => {
          importFn().catch(err => {
            console.error('Erreur lors du préchargement:', err);
          });
        });
      }
    }, 1000); // Délai d'une seconde après la navigation
    
    return () => clearTimeout(timer);
  }, [pathname]);
};
