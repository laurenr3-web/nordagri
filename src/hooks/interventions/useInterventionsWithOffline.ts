
import { useQueryWithOfflineSupport } from '../useQueryWithOfflineSupport';
import { useMutationWithOfflineSupport } from '../useMutationWithOfflineSupport';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { supabase } from '@/integrations/supabase/client';

export function useInterventionsWithOffline() {
  // Get all interventions with offline support
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
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Convert the Supabase data to our Intervention type
      const typedData = data?.map(item => ({
        id: item.id,
        title: item.title || '',
        description: item.description,
        status: item.status || 'scheduled',
        priority: item.priority || 'medium',
        date: item.date || new Date().toISOString().split('T')[0],
        time: item.time,
        duration: item.duration,
        scheduledDuration: item.scheduled_duration || 1,
        equipment: item.equipment || '',
        equipmentId: item.equipment_id || 0, 
        location: item.location || '',
        technician: item.technician || '',
        observations: item.observations,
        partsUsed: item.parts_used || []
      } as Intervention)) || [];
      
      return typedData;
    },
    {
      cacheKey: 'all_interventions',
      expirationMinutes: 24 * 60, // Cache for 24 hours
    }
  );

  // Add intervention with offline support
  const addIntervention = useMutationWithOfflineSupport({
    mutationFn: async (newIntervention: InterventionFormValues) => {
      const { data, error } = await supabase
        .from('interventions')
        .insert({
          title: newIntervention.title,
          description: newIntervention.description,
          status: newIntervention.status,
          priority: newIntervention.priority,
          date: newIntervention.date,
          time: newIntervention.time,
          scheduled_duration: newIntervention.scheduledDuration,
          equipment_id: newIntervention.equipmentId,
          location: newIntervention.location,
          technician: newIntervention.technician,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    offlineOptions: {
      type: 'add_intervention',
      onOfflineSuccess: () => {
        // Optionally update local UI immediately
        refetch();
      }
    }
  });

  return {
    interventions,
    isLoading,
    error,
    refetch,
    addIntervention
  };
}
