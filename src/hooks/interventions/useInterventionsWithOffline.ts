
import { useQueryWithOfflineSupport } from '@/hooks/useQueryWithOfflineSupport';
import { interventionService } from '@/services/supabase/interventionService';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { Intervention } from '@/types/Intervention';
import { toast } from 'sonner';

export function useInterventionsWithOffline() {
  const { isOnline, addToSyncQueue } = useOfflineStatus();
  
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
        // Create a local ID for offline-created intervention
        const tempId = -Math.floor(Math.random() * 10000); // Temporary negative ID
        
        // Add to sync queue
        await addToSyncQueue('add_intervention', intervention, 'interventions');
        
        toast.success("Intervention enregistrée en local", {
          description: "Elle sera synchronisée quand vous serez connecté"
        });
        
        // Return a mock response
        const mockedResponse: Intervention = {
          id: tempId, // Temporary negative ID
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
        // Store in sync queue
        await addToSyncQueue('update_intervention', intervention, 'interventions');
        
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
  
  // Delete an intervention (with offline support)
  const deleteIntervention = async (id: number | string) => {
    try {
      if (!isOnline) {
        // Store in sync queue
        await addToSyncQueue('delete_intervention', { id }, 'interventions');
        
        toast.success("Suppression enregistrée en local", {
          description: "Elle sera synchronisée quand vous serez connecté"
        });
        
        return true;
      } else {
        // Do regular API call if online
        await interventionService.deleteIntervention(id);
        return true;
      }
    } catch (error) {
      console.error('Error deleting intervention:', error);
      toast.error("Erreur lors de la suppression de l'intervention");
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
    updateIntervention,
    deleteIntervention
  };
}
