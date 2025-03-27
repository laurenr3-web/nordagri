import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '@/services/supabase/equipmentService';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

export function useEquipmentUpdate() {
  const queryClient = useQueryClient();

  const updateEquipment = async (updatedEquipment: any) => {
    console.log('Updating equipment:', updatedEquipment);
    
    try {
      // Remove UI-specific properties before sending to server
      const { usage, nextService, ...equipmentToUpdate } = updatedEquipment;
      
      // Handle purchaseDate which might be a complex object from the date picker
      if (equipmentToUpdate.purchaseDate && typeof equipmentToUpdate.purchaseDate === 'object') {
        // Check if it's a Date object
        if (equipmentToUpdate.purchaseDate instanceof Date) {
          // It's already a Date, keep it as is
        } 
        // Check if it's a date picker object with _type and value properties
        else if (equipmentToUpdate.purchaseDate._type === 'Date' && equipmentToUpdate.purchaseDate.value) {
          // Replace with actual Date if it has an ISO string
          if (equipmentToUpdate.purchaseDate.value.iso) {
            equipmentToUpdate.purchaseDate = new Date(equipmentToUpdate.purchaseDate.value.iso);
          } 
          // Or with the numeric value if available
          else if (equipmentToUpdate.purchaseDate.value.value) {
            equipmentToUpdate.purchaseDate = new Date(equipmentToUpdate.purchaseDate.value.value);
          }
          // Otherwise set to null to avoid processing errors
          else {
            equipmentToUpdate.purchaseDate = null;
          }
        } 
        // For any other non-Date object, set to null
        else if (!(equipmentToUpdate.purchaseDate instanceof Date)) {
          equipmentToUpdate.purchaseDate = null;
        }
      }
      
      // Call the update service
      const result = await equipmentService.updateEquipment(equipmentToUpdate);
      
      console.log('Equipment updated successfully:', result);
      
      // Invalidate queries to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      if (updatedEquipment.id) {
        queryClient.invalidateQueries({ queryKey: ['equipment', updatedEquipment.id] });
      }
      
      toast.success("Équipement mis à jour avec succès");
      return result;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
      toast.error("Erreur lors de la mise à jour de l'équipement", { 
        description: error.message || "Une erreur s'est produite"
      });
      throw error;
    }
  };

  return { updateEquipment };
}
