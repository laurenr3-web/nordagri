
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNetworkState } from './useNetworkState';

export function useQueryWithOfflineSupport<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  queryKey: any[],
  queryFn: () => Promise<TQueryFnData>,
  options?: UseQueryOptions<TQueryFnData, TError, TData>,
  cacheKey?: string
): UseQueryResult<TData, TError> & { isOfflineData: boolean } {
  const isOnline = useNetworkState();
  const [isOfflineData, setIsOfflineData] = useState(false);
  const cacheKeyToUse = cacheKey || `offline_cache_${queryKey.join('_')}`;
  
  // Initialize with merged options
  const queryOptions: UseQueryOptions<TQueryFnData, TError, TData> = {
    ...options,
    enabled: options?.enabled !== false && (isOnline || options?.staleTime === Infinity),
    staleTime: isOnline ? options?.staleTime : Infinity,
  };
  
  const result = useQuery<TQueryFnData, TError, TData>(
    queryKey,
    async () => {
      try {
        // If online, execute the query and cache the result
        if (isOnline) {
          const data = await queryFn();
          localStorage.setItem(cacheKeyToUse, JSON.stringify(data));
          setIsOfflineData(false);
          return data;
        }
        
        // If offline, throw error to trigger the onError callback
        throw new Error('Network is offline');
      } catch (error) {
        // If there's cached data, use it
        const cachedData = localStorage.getItem(cacheKeyToUse);
        if (cachedData) {
          setIsOfflineData(true);
          return JSON.parse(cachedData) as TQueryFnData;
        }
        throw error;
      }
    },
    queryOptions
  );
  
  // Load cached data when offline
  useEffect(() => {
    // Only try to load from cache if we're offline and the query should be enabled
    if (!isOnline && options?.enabled !== false) {
      const cachedData = localStorage.getItem(cacheKeyToUse);
      if (cachedData) {
        setIsOfflineData(true);
      }
    }
  }, [isOnline, cacheKeyToUse, options?.enabled]);

  return {
    ...result,
    isOfflineData
  };
}
