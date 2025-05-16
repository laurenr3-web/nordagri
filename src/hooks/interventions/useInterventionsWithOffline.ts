
import { useQueryWithOfflineSupport } from '@/hooks/useQueryWithOfflineSupport';
import { interventionService } from '@/services/supabase/interventionService';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { OfflineSyncService } from '@/services/offline/offlineSyncService';
import { Intervention } from '@/types/Intervention';
import { toast } from 'sonner';

export function useInterventionsWithOffline() {
  const { isOnline } = useOfflineStatus();
  
  // Fetch interventions with offline support
  const { 
    data: interventions,
    isLoading,
    error,
    refetch,
    isOfflineData
  } = useQueryWithOfflineSupport<Intervention[]>(
    ['interventions'],
    () => interventionService.getInterventions(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: isOnline
    },
    'interventions_cache'
  );
  
  // Create an intervention (with offline support)
  const createIntervention = async (intervention: any) => {
    try {
      if (!isOnline) {
        // Store in local sync queue if offline
        const id = OfflineSyncService.addToSyncQueue('add_intervention', intervention);
        toast.success("Intervention enregistrée en local", {
          description: "Elle sera synchronisée quand vous serez connecté"
        });
        
        // Return a mock response
        const mockedResponse: Intervention = {
          id: -Math.floor(Math.random() * 10000), // Temporary negative ID
          title: intervention.title,
          equipment: intervention.equipment,
          equipmentId: intervention.equipmentId,
          location: intervention.location,
          coordinates: { lat: 0, lng: 0 },
          status: 'scheduled',
          priority: intervention.priority,
          date: intervention.date,
          scheduledDuration: intervention.scheduledDuration,
          technician: intervention.technician,
          description: intervention.description,
          notes: intervention.notes || "",
          partsUsed: []
        };
        return mockedResponse;
      } else {
        // Do regular API call if online
        return await interventionService.addIntervention(intervention);
      }
    } catch (error) {
      console.error('Error creating intervention:', error);
      toast.error("Erreur lors de la création de l'intervention");
      throw error;
    }
  };
  
  // Update an intervention (with offline support)
  const updateIntervention = async (intervention: Intervention) => {
    try {
      if (!isOnline) {
        // Store in local sync queue if offline
        const id = OfflineSyncService.addToSyncQueue('update_intervention', intervention);
        toast.success("Modification enregistrée en local", {
          description: "Elle sera synchronisée quand vous serez connecté"
        });
        return intervention;
      } else {
        // Do regular API call if online
        return await interventionService.updateIntervention(intervention);
      }
    } catch (error) {
      console.error('Error updating intervention:', error);
      toast.error("Erreur lors de la mise à jour de l'intervention");
      throw error;
    }
  };

  return {
    interventions: interventions || [],
    isLoading,
    error,
    refetch,
    isOfflineData,
    createIntervention,
    updateIntervention
  };
}
