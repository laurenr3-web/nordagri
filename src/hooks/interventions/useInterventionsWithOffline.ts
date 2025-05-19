
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as interventionService from '@/services/interventionService';
import { syncService } from '@/services/syncService';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNetworkState } from '@/hooks/useNetworkState';
import { Intervention } from '@/types/Intervention';
import { SyncOperationType } from '@/providers/OfflineProvider';

// Hook to manage interventions with offline support
export const useInterventionsWithOffline = () => {
  const queryClient = useQueryClient();
  const isOnline = useNetworkState();
  const [cachedInterventions, setCachedInterventions] = useLocalStorage<Intervention[]>('cached-interventions', []);
  
  // Fetch interventions with offline support
  const { data: interventions, isLoading, error } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => {
      if (isOnline) {
        const data = await interventionService.fetchInterventions();
        setCachedInterventions(data); // Update cache when online
        return data;
      } else {
        return cachedInterventions; // Use cached data when offline
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Create intervention with offline support
  const createMutation = useMutation({
    mutationFn: async (newIntervention: Partial<Intervention>) => {
      if (isOnline) {
        return await interventionService.createIntervention(newIntervention);
      } else {
        // Generate a temporary ID for offline mode
        const tempId = Date.now();
        const tempIntervention = { 
          ...newIntervention, 
          id: tempId,
          _isOffline: true 
        } as Intervention;
        
        // Queue for sync when online
        await syncService.addOperation({
          type: SyncOperationType.CREATE,
          entity: 'interventions',
          data: newIntervention,
          priority: 1
        });
        
        return tempIntervention;
      }
    },
    onSuccess: (data) => {
      // Update cache and queryClient
      setCachedInterventions(prev => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    }
  });
  
  // Update intervention with offline support
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<Intervention> }) => {
      if (isOnline) {
        return await interventionService.updateIntervention(id, data);
      } else {
        // Queue for sync when online
        await syncService.addOperation({
          type: SyncOperationType.UPDATE,
          entity: 'interventions',
          data: { id, ...data },
          priority: 2
        });
        
        // Return optimistic update
        const updatedIntervention = { 
          ...data, 
          id: typeof id === 'string' ? parseInt(id, 10) : id,
          _isOffline: true 
        } as Intervention;
        return updatedIntervention;
      }
    },
    onSuccess: (data) => {
      // Update cache and queryClient
      setCachedInterventions(prev => 
        prev.map(item => item.id === data.id ? { ...item, ...data } : item)
      );
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    }
  });
  
  // Delete intervention with offline support
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      if (isOnline) {
        return await interventionService.deleteIntervention(id);
      } else {
        // Queue for sync when online
        await syncService.addOperation({
          type: SyncOperationType.DELETE,
          entity: 'interventions',
          data: { id },
          priority: 3
        });
        
        return true;
      }
    },
    onSuccess: (_, id) => {
      // Update cache and queryClient
      setCachedInterventions(prev => prev.filter(item => item.id !== id));
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    }
  });
  
  return {
    interventions,
    isLoading,
    error,
    createIntervention: createMutation.mutate,
    updateIntervention: updateMutation.mutate,
    deleteIntervention: deleteMutation.mutate,
    isOfflineMode: !isOnline
  };
};
