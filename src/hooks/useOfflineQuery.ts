
import { useQuery, UseQueryOptions, UseQueryResult, useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNetworkState } from './useNetworkState';
import { syncService, SyncStatus } from '@/services/syncService';

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
    cacheTime?: number; // Duration of cache validity in milliseconds
  };
}): UseOfflineQueryResult<TData> {
  const { queryKey, queryFn, enabled, staleTime, cacheParams } = options;
  const isOnline = useNetworkState();
  const [isCached, setIsCached] = useState<boolean>(false);
  const [pendingSync, setPendingSync] = useState<number>(0);
  const cacheKey = cacheParams?.cacheKey || `query_cache_${queryKey.join('_')}`;
  
  // Reference to last cached data
  const lastCachedData = useRef<TData | null>(null);
  
  // Get sync status
  useEffect(() => {
    const status = syncService.getStatus();
    setPendingSync(status.pendingSyncCount);
    
    const handleStatusChange = (newStatus: SyncStatus) => {
      setPendingSync(newStatus.pendingSyncCount);
    };
    
    syncService.addEventListener(handleStatusChange);
    
    return () => {
      syncService.removeEventListener(handleStatusChange);
    };
  }, []);
  
  // Query function adapted for offline support
  const offlineQueryFn = async (): Promise<TQueryFnData> => {
    if (isOnline) {
      try {
        // Online: execute query normally
        const data = await queryFn();
        
        // If caching is configured, store results
        if (cacheParams?.tableName) {
          await syncService.cacheQueryResult(cacheKey, data, cacheParams.tableName);
        }
        
        setIsCached(false);
        return data;
      } catch (error) {
        // On error, try to retrieve from cache
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
      // Offline: retrieve from cache
      if (!cacheParams?.tableName) {
        throw new Error('Offline and no cache configuration');
      }
      
      const cachedData = await syncService.getCachedQueryResult<TQueryFnData>(cacheKey);
      
      if (cachedData) {
        setIsCached(true);
        return cachedData;
      }
      
      throw new Error('No cached data available');
    }
  };

  // Use useQuery with our adapted function
  const queryResult = useQuery<TQueryFnData, Error, TData, TQueryKey>({
    queryKey,
    queryFn: offlineQueryFn,
    enabled: (enabled !== false) && (isOnline || cacheParams?.tableName !== undefined),
    staleTime
  });

  // If data has been loaded and cache is configured, update reference
  useEffect(() => {
    if (queryResult.data !== undefined) {
      lastCachedData.current = queryResult.data;
    }
  }, [queryResult.data]);

  // Prepare result with additional properties
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
  
  // Mutation function adapted for offline support
  const offlineMutationFn = async (variables: TVariables): Promise<TData> => {
    try {
      // If online, try normal operation first
      if (isOnline) {
        return await mutationFn(variables);
      }
      
      // If offline and sync configuration is provided
      if (syncParams) {
        const { tableName, operationType, getEntityId } = syncParams;
        
        switch (operationType) {
          case 'create':
            await syncService.create(tableName, variables);
            return {} as TData;
          
          case 'update': {
            if (!getEntityId) {
              throw new Error('getEntityId is required for update operations');
            }
            const entityId = getEntityId(variables);
            if (entityId === undefined) {
              throw new Error('Entity ID not available for update');
            }
            await syncService.update(tableName, entityId, variables);
            return variables as unknown as TData;
          }
          
          case 'delete': {
            if (!getEntityId) {
              throw new Error('getEntityId is required for delete operations');
            }
            const entityId = getEntityId(variables);
            if (entityId === undefined) {
              throw new Error('Entity ID not available for delete');
            }
            await syncService.delete(tableName, entityId);
            return {} as TData;
          }
          
          default:
            throw new Error(`Unsupported operation type: ${operationType}`);
        }
      }
      
      // If offline and no sync configuration
      throw new Error('Offline and no sync configuration');
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

// Hook for sync status information
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());
  
  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };
    
    syncService.addEventListener(handleStatusChange);
    
    return () => {
      syncService.removeEventListener(handleStatusChange);
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
