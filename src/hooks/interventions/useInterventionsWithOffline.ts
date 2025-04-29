
import { useQueryWithOfflineSupport } from '../useQueryWithOfflineSupport';
import { useMutationWithOfflineSupport } from '../useMutationWithOfflineSupport';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { supabase } from '@/integrations/supabase/client';
import { OfflineSyncService } from '@/services/offline/offlineSyncService';

export function useInterventionsWithOffline() {
  // Get interventions with offline support
  const {
    data: interventions,
    isLoading,
    error,
    refetch
  } = useQueryWithOfflineSupport<Intervention[]>(
    ['interventions'],
    async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    {
      cacheKey: 'all_interventions',
      expirationMinutes: 24 * 60, // Cache for 24 hours
    }
  );

  // Create intervention with offline support
  const createIntervention = useMutationWithOfflineSupport({
    mutationFn: async (newIntervention: InterventionFormValues) => {
      const { data, error } = await supabase
        .from('interventions')
        .insert(newIntervention)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    offlineOptions: {
      type: 'add_intervention',
      onOfflineSuccess: (newIntervention) => {
        // Optionally update UI immediately when offline
        refetch();
      }
    }
  });

  // Update intervention status with offline support
  const updateInterventionStatus = useMutationWithOfflineSupport({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data, error } = await supabase
        .from('interventions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    offlineOptions: {
      type: 'update_intervention',
      onOfflineSuccess: ({ id, status }) => {
        // Update local data immediately
        const currentData = OfflineSyncService.getCachedData<Intervention[]>('all_interventions');
        if (currentData) {
          const updatedData = currentData.map(item => 
            item.id === id ? { ...item, status } : item
          );
          OfflineSyncService.cacheData('all_interventions', updatedData, 24 * 60);
          refetch();
        }
      }
    }
  });

  // Get intervention by ID with offline support
  const getInterventionById = async (id: number): Promise<Intervention | null> => {
    try {
      // Check offline cache first
      const cacheKey = `intervention_${id}`;
      const cachedIntervention = OfflineSyncService.getCachedData<Intervention>(cacheKey);
      
      if (cachedIntervention) {
        return cachedIntervention;
      }
      
      // If not in cache or online, fetch from Supabase
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Intervention not found
        }
        throw error;
      }
      
      // Cache for offline use
      OfflineSyncService.cacheData(cacheKey, data, 24 * 60);
      
      return data;
    } catch (error) {
      console.error(`Error fetching intervention ${id}:`, error);
      return null;
    }
  };

  return {
    interventions,
    isLoading,
    error,
    refetch,
    createIntervention,
    updateInterventionStatus,
    getInterventionById
  };
}
