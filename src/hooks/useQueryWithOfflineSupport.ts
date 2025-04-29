
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useNetworkState } from './useNetworkState';
import { OfflineSyncService } from '@/services/offline/offlineSyncService';

type QueryWithOfflineSupportOptions = {
  cacheKey: string;
  expirationMinutes?: number;
  onOfflineSuccess?: () => void;
};

export function useQueryWithOfflineSupport<TData = unknown, TError = unknown>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  offlineOptions: QueryWithOfflineSupportOptions,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  const isOnline = useNetworkState();
  
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      try {
        // Try to get cached data first if offline
        if (!isOnline) {
          const cachedData = OfflineSyncService.getCachedData<TData>(offlineOptions.cacheKey);
          if (cachedData) {
            console.info('Using cached data for', offlineOptions.cacheKey);
            if (offlineOptions.onOfflineSuccess) {
              offlineOptions.onOfflineSuccess();
            }
            return cachedData;
          }
          throw new Error('No cached data available and device is offline');
        }
        
        // Online - get data and cache it
        const data = await queryFn();
        OfflineSyncService.cacheData(
          offlineOptions.cacheKey,
          data,
          offlineOptions.expirationMinutes || 60 // Default to 1 hour
        );
        return data;
      } catch (error) {
        // If we're offline but have cached data, use it
        if (!isOnline) {
          const cachedData = OfflineSyncService.getCachedData<TData>(offlineOptions.cacheKey);
          if (cachedData) {
            console.info('Using cached data on error for', offlineOptions.cacheKey);
            if (offlineOptions.onOfflineSuccess) {
              offlineOptions.onOfflineSuccess();
            }
            return cachedData;
          }
        }
        throw error;
      }
    },
    ...options,
    // Don't refetch automatically when offline
    refetchOnWindowFocus: isOnline && (options?.refetchOnWindowFocus ?? true),
    refetchOnMount: isOnline && (options?.refetchOnMount ?? true),
    refetchOnReconnect: isOnline && (options?.refetchOnReconnect ?? true),
    staleTime: !isOnline ? Infinity : options?.staleTime,
  });
}
