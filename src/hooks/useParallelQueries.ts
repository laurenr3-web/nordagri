
import { useQueries } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface QueryConfig {
  queryKey: string[];
  queryFn: () => Promise<any>;
  staleTime?: number;
  enabled?: boolean;
}

/**
 * Hook pour exécuter plusieurs requêtes en parallèle
 * @param queries Configurations des requêtes à exécuter
 * @returns Résultats agrégés des requêtes
 */
export function useParallelQueries(queries: QueryConfig[]) {
  // Utiliser useQueries pour exécuter toutes les requêtes en parallèle
  const results = useQueries({
    queries: queries.map((query) => ({
      queryKey: query.queryKey,
      queryFn: query.queryFn,
      staleTime: query.staleTime || 1000 * 60 * 5, // 5 minutes par défaut
      enabled: query.enabled !== undefined ? query.enabled : true,
    })),
  });
  
  // États agrégés pour toutes les requêtes
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  
  // Mettre à jour les états agrégés quand les résultats changent
  useEffect(() => {
    const anyLoading = results.some(result => result.isLoading);
    const anyError = results.some(result => result.isError);
    const errorMsgs = results
      .filter(result => result.error)
      .map(result => result.error?.message || 'Une erreur est survenue');
    
    setIsLoading(anyLoading);
    setIsError(anyError);
    setErrorMessages(errorMsgs);
  }, [results]);
  
  // Extraire uniquement les données de toutes les requêtes
  const data = results.map(result => result.data);
  
  return {
    data,
    isLoading,
    isError,
    errorMessages,
    results // Retourner également les résultats bruts si nécessaire
  };
}
