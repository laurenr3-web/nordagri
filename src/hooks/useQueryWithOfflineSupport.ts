import { useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { useNetworkState } from '@/hooks/useNetworkState';
import { OfflineSyncService } from '@/services/offline/offlineSyncService';

export function useQueryWithOfflineSupport<TData = unknown, TError = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'> & {
    cacheKey?: string; // Optional specific cache key, defaults to stringified queryKey
    expirationMinutes?: number; // Cache expiration in minutes
  }
) {
  const isOnline = useNetworkState();
  const queryClient = useQueryClient();
  const cacheKey = options?.cacheKey || `query_${JSON.stringify(queryKey)}`;
  const expirationMinutes = options?.expirationMinutes || 60; // Default 1 hour cache
  
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      try {
        if (!isOnline) {
          // If offline, try to get data from local cache
          const cachedData = OfflineSyncService.getCachedData<TData>(cacheKey);
          if (cachedData) {
            console.log(`[Offline] Using cached data for ${cacheKey}`);
            return cachedData;
          }
          throw new Error('No cached data available and device is offline');
        }
        
        // Online: fetch data normally
        const data = await queryFn();
        
        // Cache the fresh data for offline use
        if (data) {
          OfflineSyncService.cacheData(cacheKey, data, expirationMinutes);
        }
        
        return data;
      } catch (error) {
        // Error handling
        console.error(`[Query] Error fetching data for ${cacheKey}:`, error);
        
        // If any error occurs, try to use cached data
        const cachedData = OfflineSyncService.getCachedData<TData>(cacheKey);
        if (cachedData) {
          console.log(`[Offline] Using cached data after error for ${cacheKey}`);
          return cachedData;
        }
        
        // No cached data, re-throw the error
        throw error;
      }
    },
    ...options,
    staleTime: isOnline ? options?.staleTime : Infinity, // Prevent refetching when offline
  });
}

// Helper hook to preload query data in cache
export function usePrefetchWithOfflineCache<TData = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: {
    cacheKey?: string;
    expirationMinutes?: number;
  }
) {
  const queryClient = useQueryClient();
  const cacheKey = options?.cacheKey || `query_${JSON.stringify(queryKey)}`;
  const expirationMinutes = options?.expirationMinutes || 60;
  
  const prefetch = async () => {
    try {
      // Check if we already have this data in the query cache
      const existingData = queryClient.getQueryData<TData>(queryKey);
      
      if (existingData) {
        // If it exists in the query cache, update the offline cache too
        OfflineSyncService.cacheData(cacheKey, existingData, expirationMinutes);
        return existingData;
      }
      
      // Otherwise fetch it
      const data = await queryFn();
      
      // Store in the query cache
      queryClient.setQueryData(queryKey, data);
      
      // And in the offline cache
      OfflineSyncService.cacheData(cacheKey, data, expirationMinutes);
      
      return data;
    } catch (error) {
      console.error(`Error prefetching data for ${cacheKey}:`, error);
    }
  };
  
  return { prefetch };
}
