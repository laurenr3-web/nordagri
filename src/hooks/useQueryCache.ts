
import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer le cache avec React Query de façon standardisée
 * @returns Fonctions utilitaires pour interagir avec le cache
 */
export function useQueryCache() {
  const queryClient = useQueryClient();
  const [isFetching, setIsFetching] = useState(false);
  
  /**
   * Invalide plusieurs clés de requêtes à la fois
   * @param queryKeys Tableau de clés de requêtes à invalider
   */
  const invalidateQueries = useCallback(async (queryKeys: string[][]) => {
    setIsFetching(true);
    try {
      await Promise.all(
        queryKeys.map(key => queryClient.invalidateQueries({ queryKey: key }))
      );
    } finally {
      setIsFetching(false);
    }
  }, [queryClient]);
  
  /**
   * Précharge des données dans le cache
   * @param queryKey Clé de la requête
   * @param fetcher Fonction pour récupérer les données
   */
  const prefetchQuery = useCallback(async (queryKey: string[], fetcher: () => Promise<any>) => {
    setIsFetching(true);
    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: fetcher,
        staleTime: 1000 * 60 * 5 // 5 minutes
      });
    } finally {
      setIsFetching(false);
    }
  }, [queryClient]);
  
  /**
   * Récupère des données du cache ou les charge si nécessaire
   * @param queryKey Clé de la requête
   * @param fetcher Fonction pour récupérer les données
   */
  const ensureCachedData = useCallback(async (queryKey: string[], fetcher: () => Promise<any>) => {
    const cachedData = queryClient.getQueryData(queryKey);
    if (!cachedData) {
      await prefetchQuery(queryKey, fetcher);
    }
    return cachedData || queryClient.getQueryData(queryKey);
  }, [queryClient, prefetchQuery]);
  
  return {
    invalidateQueries,
    prefetchQuery,
    ensureCachedData,
    isFetching,
    queryClient
  };
}
