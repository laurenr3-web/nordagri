
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useNetworkState } from '@/hooks/useNetworkState';
import { OfflineSyncService, SyncQueueItem } from '@/services/offline/offlineSyncService';
import { toast } from 'sonner';

type MutationWithOfflineSupportOptions<TData = unknown, TError = unknown, TVariables = unknown> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  offlineOptions: {
    type: SyncQueueItem['type'];
    onOfflineSuccess?: (variables: TVariables) => void;
  };
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>;
};

export function useMutationWithOfflineSupport<TData = unknown, TError = unknown, TVariables = unknown>({
  mutationFn,
  offlineOptions,
  options
}: MutationWithOfflineSupportOptions<TData, TError, TVariables>): UseMutationResult<TData, TError, TVariables, unknown> {
  const isOnline = useNetworkState();
  
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        if (!isOnline) {
          // Device is offline, add to sync queue
          const id = OfflineSyncService.addToSyncQueue(
            offlineOptions.type,
            variables
          );
          
          toast.info('Action enregistrée pour synchronisation ultérieure', {
            description: 'Elle sera exécutée automatiquement quand vous serez connecté'
          });
          
          // Call offline success handler if provided
          if (offlineOptions.onOfflineSuccess) {
            offlineOptions.onOfflineSuccess(variables);
          }
          
          // Return a mock response
          return {} as TData;
        }
        
        // Device is online, proceed with normal mutation
        return await mutationFn(variables);
      } catch (error) {
        // If online but error occurs, try to queue for later
        if (isOnline) {
          console.error('Error during mutation, queuing for retry:', error);
          
          const id = OfflineSyncService.addToSyncQueue(
            offlineOptions.type,
            variables
          );
          
          toast.error('Erreur lors de l\'opération', {
            description: 'Votre modification a été enregistrée et sera réessayée plus tard'
          });
        }
        
        throw error;
      }
    },
    ...options
  });
}
