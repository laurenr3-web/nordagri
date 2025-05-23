
import { useEffect, useCallback, useRef } from 'react';

export const useAutoRefresh = (interval: number) => {
  const intervalRef = useRef<NodeJS.Timeout>();

  const refresh = useCallback(() => {
    // Force un refresh de la page - simplicité pour la première version
    window.location.reload();
  }, []);

  useEffect(() => {
    if (interval > 0) {
      intervalRef.current = setInterval(refresh, interval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [interval, refresh]);

  const manualRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return { refresh: manualRefresh };
};
