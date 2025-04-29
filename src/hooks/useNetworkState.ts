
import { useState, useEffect } from 'react';

/**
 * Hook pour déterminer si l'utilisateur est en ligne ou hors ligne
 * @returns boolean - true si l'utilisateur est en ligne, false sinon
 */
export function useNetworkState(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Fonctions de gestionnaire d'événements pour mettre à jour l'état
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Ajouter des écouteurs d'événements
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Nettoyer les écouteurs d'événements à la destruction du composant
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useNetworkState;
