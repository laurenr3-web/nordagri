
import { useQuery, UseQueryOptions, UseQueryResult, useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNetworkState } from './useNetworkState';
import { syncService, SyncStatus } from '@/services/syncService';

// This line caused the issue because we were trying to set the Supabase client
// but it's not defined in this context currently, so let's comment it out for now
// syncService.setSupabaseClient(supabase);

export interface UseOfflineQueryResult<TData> extends Omit<UseQueryResult<TData, Error>, 'data' | 'error'> {
  data: TData | undefined;
  error: Error | null;
  isOffline: boolean;
  isCached: boolean;
  pendingSync: number;
}

export function useOfflineQuery<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends any[] = any[]
>(options: {
  queryKey: TQueryKey;
  queryFn: () => Promise<TQueryFnData>;
  enabled?: boolean;
  staleTime?: number;
  cacheParams?: {
    tableName: string;
    cacheKey?: string;
    cacheTime?: number; // Durée de validité du cache en millisecondes
  };
}): UseOfflineQueryResult<TData> {
  const { queryKey, queryFn, enabled, staleTime, cacheParams } = options;
  const isOnline = useNetworkState();
  const [isCached, setIsCached] = useState<boolean>(false);
  const [pendingSync, setPendingSync] = useState<number>(0);
  const cacheKey = cacheParams?.cacheKey || `query_cache_${queryKey.join('_')}`;
  
  // Référence à la dernière donnée mise en cache
  const lastCachedData = useRef<TData | null>(null);
  
  // Récupérer le statut de synchronisation
  useEffect(() => {
    const syncStatus = syncService.getStatus();
    setPendingSync(syncStatus.pendingSyncCount);
    
    const handleStatusChange = (status: SyncStatus) => {
      setPendingSync(status.pendingSyncCount);
    };
    
    syncService.addEventListener('statusChange', handleStatusChange);
    
    return () => {
      syncService.removeEventListener('statusChange', handleStatusChange);
    };
  }, []);
  
  // Fonction de requête adaptée pour le support hors ligne
  const offlineQueryFn = async (): Promise<TQueryFnData> => {
    if (isOnline) {
      try {
        // En ligne: exécuter la requête normalement
        const data = await queryFn();
        
        // Si la mise en cache est configurée, stocker les résultats
        if (cacheParams?.tableName) {
          await syncService.cacheQueryResult(cacheKey, data, cacheParams.tableName);
        }
        
        setIsCached(false);
        return data;
      } catch (error) {
        // En cas d'erreur, essayer de récupérer du cache
        if (cacheParams?.tableName) {
          const cachedData = await syncService.getCachedQueryResult<TQueryFnData>(cacheKey);
          if (cachedData) {
            setIsCached(true);
            return cachedData;
          }
        }
        throw error;
      }
    } else {
      // Hors ligne: récupérer du cache
      if (!cacheParams?.tableName) {
        throw new Error('Hors ligne et pas de configuration de cache');
      }
      
      const cachedData = await syncService.getCachedQueryResult<TQueryFnData>(cacheKey);
      
      if (cachedData) {
        setIsCached(true);
        return cachedData;
      }
      
      throw new Error('Aucune donnée en cache disponible');
    }
  };

  // Utiliser useQuery avec notre fonction adaptée
  const queryResult = useQuery<TQueryFnData, Error, TData, TQueryKey>({
    queryKey,
    queryFn: offlineQueryFn,
    enabled: (enabled !== false) && (isOnline || cacheParams?.tableName !== undefined),
    staleTime
  });

  // Si des données ont été chargées et que nous avons une configuration de cache, mettre à jour la référence
  useEffect(() => {
    if (queryResult.data !== undefined) {
      lastCachedData.current = queryResult.data;
    }
  }, [queryResult.data]);

  // Prépare le résultat avec les propriétés supplémentaires
  const result: UseOfflineQueryResult<TData> = {
    ...queryResult,
    data: queryResult.data,
    error: queryResult.error || null,
    isOffline: !isOnline,
    isCached,
    pendingSync
  };

  return result;
}

export function useOfflineMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
  syncParams?: {
    tableName: string;
    operationType: 'create' | 'update' | 'delete';
    getEntityId?: (variables: TVariables) => string | number | undefined;
  }
): UseMutationResult<TData, TError, TVariables, TContext> & { isOffline: boolean } {
  const isOnline = useNetworkState();
  
  // Fonction de mutation adaptée pour le support hors ligne
  const offlineMutationFn = async (variables: TVariables): Promise<TData> => {
    try {
      // Si en ligne, essayer d'abord l'opération normale
      if (isOnline) {
        return await mutationFn(variables);
      }
      
      // Si hors ligne et que la synchronisation est configurée
      if (syncParams) {
        const { tableName, operationType, getEntityId } = syncParams;
        
        switch (operationType) {
          case 'create':
            await syncService.create(tableName, variables);
            return {} as TData; // Retourner un objet vide comme résultat temporaire
          
          case 'update': {
            if (!getEntityId) {
              throw new Error('getEntityId est requis pour les opérations de mise à jour');
            }
            const entityId = getEntityId(variables);
            if (entityId === undefined) {
              throw new Error('ID d\'entité non disponible pour la mise à jour');
            }
            await syncService.update(tableName, entityId, variables);
            return variables as unknown as TData; // Retourner les variables comme résultat
          }
          
          case 'delete': {
            if (!getEntityId) {
              throw new Error('getEntityId est requis pour les opérations de suppression');
            }
            const entityId = getEntityId(variables);
            if (entityId === undefined) {
              throw new Error('ID d\'entité non disponible pour la suppression');
            }
            await syncService.delete(tableName, entityId);
            return {} as TData;
          }
          
          default:
            throw new Error(`Type d'opération non pris en charge: ${operationType}`);
        }
      }
      
      // Si hors ligne et pas de configuration de synchronisation
      throw new Error('Hors ligne et pas de configuration de synchronisation');
    } catch (error) {
      throw error;
    }
  };

  const mutationResult = useMutation<TData, TError, TVariables, TContext>({
    mutationFn: offlineMutationFn,
    ...options
  });

  return {
    ...mutationResult,
    isOffline: !isOnline
  };
}

// Hook utilitaire pour obtenir des informations sur le statut de synchronisation
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());
  
  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };
    
    syncService.addEventListener('statusChange', handleStatusChange);
    
    return () => {
      syncService.removeEventListener('statusChange', handleStatusChange);
    };
  }, []);
  
  const syncNow = useCallback(() => {
    return syncService.sync();
  }, []);
  
  return {
    ...status,
    syncNow
  };
}
