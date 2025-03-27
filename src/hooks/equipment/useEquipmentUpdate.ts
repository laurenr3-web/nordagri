
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '@/services/supabase/equipmentService';
import { Equipment } from '@/services/supabase/equipment/types';

/**
 * Prepares equipment data for server update by cleaning UI-specific properties
 * @param equipmentData The equipment data from the UI
 * @returns Cleaned equipment data ready for the server
 */
function prepareEquipmentForUpdate(equipmentData: any): any {
  // Remove UI-specific properties
  const { usage, nextService, ...equipmentToUpdate } = equipmentData;
  return equipmentToUpdate;
}

/**
 * Hook for updating equipment data
 * @returns Object containing the update function and loading state
 */
export function useEquipmentUpdate() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Updates equipment in the database
   * @param updatedEquipment Equipment with updated values
   * @returns Promise resolving to the updated equipment
   */
  const updateEquipment = async (updatedEquipment: any): Promise<Equipment> => {
    console.log('Updating equipment:', updatedEquipment);
    setIsLoading(true);
    
    try {
      // Prepare data for update
      const equipmentToUpdate = prepareEquipmentForUpdate(updatedEquipment);
      
      // Call the update service
      const result = await equipmentService.updateEquipment(equipmentToUpdate);
      
      console.log('Equipment updated successfully:', result);
      
      // Invalidate queries to refresh data
      invalidateQueries(queryClient, updatedEquipment.id);
      
      toast.success("Équipement mis à jour avec succès");
      return result;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
      toast.error("Erreur lors de la mise à jour de l'équipement", { 
        description: error.message || "Une erreur s'est produite"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateEquipment, isLoading };
}

/**
 * Helper function to invalidate relevant queries after an update
 * @param queryClient The React Query client
 * @param equipmentId ID of the updated equipment
 */
function invalidateQueries(queryClient: any, equipmentId?: number): void {
  queryClient.invalidateQueries({ queryKey: ['equipment'] });
  if (equipmentId) {
    queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
  }
}
