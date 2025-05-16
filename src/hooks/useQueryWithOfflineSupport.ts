
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNetworkState } from './useNetworkState';
import { IndexedDBService } from '@/services/offline/indexedDBService';

export function useQueryWithOfflineSupport<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  queryKey: any[],
  queryFn: () => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, any[]>, 'queryKey' | 'queryFn'>,
  cacheKey?: string
): UseQueryResult<TData, TError> & { isOfflineData: boolean } {
  const isOnline = useNetworkState();
  const [isOfflineData, setIsOfflineData] = useState(false);
  const cacheKeyToUse = cacheKey || `offline_cache_${queryKey.join('_')}`;
  
  // Initialize with merged options
  const queryOptions: UseQueryOptions<TQueryFnData, TError, TData, any[]> = {
    queryKey,
    queryFn: async () => {
      try {
        // If online, execute the query and cache the result
        if (isOnline) {
          const data = await queryFn();
          
          // Store in IndexedDB
          await IndexedDBService.updateInStore('offline_cache', {
            key: cacheKeyToUse,
            data,
            timestamp: Date.now()
          });
          
          setIsOfflineData(false);
          return data;
        }
        
        // If offline, throw error to trigger the onError callback
        throw new Error('Network is offline');
      } catch (error) {
        // If there's cached data, use it
        const cacheItem = await IndexedDBService.getByKey('offline_cache', cacheKeyToUse);
        
        if (cacheItem?.data) {
          setIsOfflineData(true);
          return cacheItem.data as TQueryFnData;
        }
        throw error;
      }
    },
    ...options,
    enabled: options?.enabled !== false && (isOnline || options?.staleTime === Infinity),
    staleTime: isOnline ? options?.staleTime : Infinity,
  };
  
  // Load cached data when offline
  useEffect(() => {
    const loadFromCache = async () => {
      // Only try to load from cache if we're offline and the query should be enabled
      if (!isOnline && options?.enabled !== false) {
        const cacheItem = await IndexedDBService.getByKey('offline_cache', cacheKeyToUse);
        if (cacheItem?.data) {
          setIsOfflineData(true);
        }
      }
    };
    
    loadFromCache();
  }, [isOnline, cacheKeyToUse, options?.enabled]);

  const result = useQuery<TQueryFnData, TError, TData>(queryOptions);

  return {
    ...result,
    isOfflineData
  };
}
