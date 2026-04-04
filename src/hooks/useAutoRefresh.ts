
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useAutoRefresh = (interval: number) => {
  const queryClient = useQueryClient();

  const refresh = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  // Auto-refresh disabled — rely on staleTime + manual refresh
  // If needed, uncomment:
  // useEffect(() => {
  //   if (interval > 0) {
  //     const id = setInterval(refresh, interval);
  //     return () => clearInterval(id);
  //   }
  // }, [interval, refresh]);

  return { refresh };
};
