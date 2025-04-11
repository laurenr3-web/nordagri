
import { useQuery, useMutation, useQueryClient, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

// Types génériques pour les fonctions de requête et de mutation
type QueryFn<T> = () => Promise<T>;
type MutationFn<T, P> = (params: P) => Promise<T>;

// Type pour PlaceholderData compatible avec TanStack Query v5
type PlaceholderDataFunction<TData> = (previousData?: TData) => TData;

/**
 * Options pour useStandardQuery
 */
interface QueryOptions<T> {
  queryKey: QueryKey;
  queryFn: QueryFn<T>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  suspense?: boolean;
  placeholderData?: T | PlaceholderDataFunction<T>;
}

/**
 * Options pour useStandardMutation
 */
interface MutationOptions<T, P> {
  mutationFn: MutationFn<T, P>;
  onSuccess?: (data: T, variables: P) => void;
  onError?: (error: Error, variables: P) => void;
  onSettled?: (data: T | undefined, error: Error | null, variables: P) => void;
  invalidateQueries?: QueryKey[];
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook standardisé pour les requêtes de données
 * - Configuration cohérente
 * - Gestion intégrée des erreurs et succès
 * - Paramètres par défaut optimisés
 */
export function useStandardQuery<T>(options: QueryOptions<T>): UseQueryResult<T, Error> {
  const {
    queryKey,
    queryFn,
    staleTime = 1000 * 60 * 5, // 5 minutes par défaut
    gcTime = 1000 * 60 * 30, // 30 minutes par défaut
    enabled = true,
    refetchOnWindowFocus = false,
    onSuccess,
    onError,
    suspense = false,
    placeholderData
  } = options;

  // Configuration de la requête avec TanStack Query v5
  const queryOptions = {
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    enabled,
    refetchOnWindowFocus,
    suspense,
    placeholderData: placeholderData as any,
    onSuccess: (data: T) => {
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Une erreur est survenue lors de la récupération des données';
      if (onError) onError(error);
    }
  };

  return useQuery(queryOptions);
}

/**
 * Hook standardisé pour les mutations de données
 * - Gestion cohérente des états (chargement, erreur, succès)
 * - Messages toast intégrés
 * - Invalidation automatique des requêtes associées
 */
export function useStandardMutation<T, P = any>(options: MutationOptions<T, P>) {
  const {
    mutationFn,
    onSuccess,
    onError,
    onSettled,
    invalidateQueries = [],
    successMessage = 'Opération réussie',
    errorMessage = 'Une erreur est survenue'
  } = options;

  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn,
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data, variables) => {
      // Afficher le message de succès si fourni
      toast.success(successMessage);
      
      // Invalider les requêtes si nécessaire
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Appeler le callback personnalisé si fourni
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error: any, variables) => {
      // Afficher le message d'erreur
      toast.error(errorMessage, {
        description: error?.message || 'Veuillez réessayer plus tard'
      });
      
      // Appeler le callback personnalisé si fourni
      if (onError) onError(error, variables);
    },
    onSettled: (data, error, variables) => {
      setIsLoading(false);
      
      // Appeler le callback personnalisé si fourni
      if (onSettled) onSettled(data, error, variables as P);
    }
  });

  // Fonction wrapper pour simplifier l'appel de mutation
  const execute = useCallback(async (params: P): Promise<T | undefined> => {
    try {
      return await mutation.mutateAsync(params);
    } catch (error) {
      return undefined;
    }
  }, [mutation]);

  return {
    ...mutation,
    execute,
    isLoading
  };
}
