
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { updateEquipment } from '@/services/supabase/equipment/mutations';

export function useEquipmentUpdate() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Met à jour un équipement dans la base de données
   */
  const updateEquipmentHandler = async (updatedEquipment: any) => {
    try {
      setIsLoading(true);
      
      // Nettoyage des données de l'équipement pour la mise à jour
      const equipmentToUpdate = { ...updatedEquipment };
      
      // Appel au service de mise à jour
      const result = await updateEquipment(equipmentToUpdate);
      
      // Invalidation du cache de requêtes
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', updatedEquipment.id] });
      
      toast.success('Équipement mis à jour avec succès');
      return result;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'équipement:', error);
      toast.error('Erreur lors de la mise à jour', {
        description: error.message || 'Une erreur s\'est produite'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    updateEquipment: updateEquipmentHandler,
    isLoading
  };
}
