
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNetworkState } from '@/hooks/useNetworkState';
import { OfflineSyncService } from '@/services/offline/offlineSyncService';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { toast } from 'sonner';

// Make sure to use proper type checking to prevent string/number type errors
const ensureNumericId = (id: string | number): number => {
  if (typeof id === 'string') {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error('Invalid ID: Could not convert string to number');
    }
    return numericId;
  }
  return id;
};

export function useInterventionsWithOffline() {
  const isOnline = useNetworkState();
  const { addToSyncQueue } = useOfflineStatus();
  const queryClient = useQueryClient();
  
  // Fetch interventions (this would normally be using useQueryWithOfflineSupport)
  const interventionsQuery = useQuery({
    queryKey: ['interventions'],
    // Your normal fetching function here
    queryFn: async () => {
      // Simplified example
      return [];
    },
    // Disable refetching when offline
    enabled: isOnline
  });
  
  // Add intervention with offline support
  const addIntervention = useMutation({
    mutationFn: async (interventionData: any) => {
      if (isOnline) {
        // Online: Direct API call
        // Your API call here
        return { id: 123 }; // Example response
      } else {
        // Offline: Queue for later sync
        const localId = OfflineSyncService.createLocalId('add_intervention');
        const dataWithLocalId = { ...interventionData, id: localId };
        
        // Add to sync queue
        await addToSyncQueue('create', dataWithLocalId, 'interventions');
        
        // Return the local data so UI can update immediately
        return dataWithLocalId;
      }
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['interventions'], (old: any[] = []) => {
        return [...old, data];
      });
      
      // Show success message
      toast.success(isOnline ? 'Intervention ajoutée' : 'Intervention ajoutée (synchronisation en attente)');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
  
  // Update intervention with offline support
  const updateIntervention = useMutation({
    mutationFn: async (interventionData: any) => {
      if (isOnline) {
        // Online: Direct API call
        // Your API call here
        return interventionData;
      } else {
        // Offline: Queue for later sync
        await addToSyncQueue('update', interventionData, 'interventions', interventionData.id);
        
        // Return the data so UI can update immediately
        return interventionData;
      }
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['interventions'], (old: any[] = []) => {
        return old?.map(item => item.id === data.id ? data : item) || [];
      });
      
      // Update specific intervention cache
      if (data.id) {
        try {
          // Convert to number if it's a string to ensure consistency
          const numericId = ensureNumericId(data.id);
          queryClient.setQueryData(['intervention', numericId], data);
        } catch (e) {
          console.error('Error updating intervention cache:', e);
        }
      }
      
      toast.success(isOnline ? 'Intervention mise à jour' : 'Intervention mise à jour (synchronisation en attente)');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
  
  // Delete intervention with offline support
  const deleteIntervention = useMutation({
    mutationFn: async (id: number) => {
      if (isOnline) {
        // Online: Direct API call
        // Your API call here
        return id;
      } else {
        // Offline: Queue for later sync
        await addToSyncQueue('delete', { id }, 'interventions', id);
        
        // Return the id so UI can update immediately
        return id;
      }
    },
    onSuccess: (id) => {
      // Update cache
      queryClient.setQueryData(['interventions'], (old: any[] = []) => {
        return old?.filter(item => item.id !== id) || [];
      });
      
      // Remove specific intervention cache
      queryClient.removeQueries({ queryKey: ['intervention', id] });
      
      toast.success(isOnline ? 'Intervention supprimée' : 'Intervention supprimée (synchronisation en attente)');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return {
    interventions: interventionsQuery.data || [],
    isLoading: interventionsQuery.isLoading,
    isError: interventionsQuery.isError,
    error: interventionsQuery.error,
    addIntervention,
    updateIntervention,
    deleteIntervention,
    isOnline
  };
}
