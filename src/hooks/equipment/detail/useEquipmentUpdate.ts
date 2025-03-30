import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { equipmentService } from '@/services/supabase/equipmentService';

export function useEquipmentUpdate(id: string | undefined, setEquipment: (equipment: any) => void) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const handleEquipmentUpdate = async (updatedEquipment: any) => {
    try {
      console.log('Updating equipment:', updatedEquipment);
      setLoading(true);
      
      // Remove any UI-specific properties before sending to the server
      const { usage, nextService, lastMaintenance, ...equipmentForUpdate } = updatedEquipment;
      
      const result = await equipmentService.updateEquipment(equipmentForUpdate);
      console.log('Update result:', result);
      
      // Update local state with the result from the server
      setEquipment(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          ...result,
          // Convert potential Date objects to strings for UI display
          purchaseDate: result.purchaseDate 
            ? (typeof result.purchaseDate === 'object' 
               ? result.purchaseDate.toISOString() 
               : String(result.purchaseDate))
            : prev.purchaseDate || '',
          // Keep UI-specific properties
          lastMaintenance: prev.lastMaintenance || 'N/A',
          usage: prev.usage || { hours: 0, target: 500 },
          nextService: prev.nextService || { type: 'Regular maintenance', due: 'Non planifié' }
        };
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', Number(id)] });
      
      toast.success('Équipement mis à jour avec succès');
      return result;
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { handleEquipmentUpdate, loading };
}
